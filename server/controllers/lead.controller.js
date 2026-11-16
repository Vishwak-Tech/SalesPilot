
import Lead from "../models/Lead.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import {
  leadCreateSchema,
  leadUpdateSchema,
  reorderLeadsSchema,
} from "../validators/lead.validator.js";

// Escape special regex characters
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Get all leads
export const getLeads = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    source,
    search,
    page = "1",
    limit = "20",
  } = req.query;

  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 20)
  );

  const filter = {
    owner: req.user._id,
  };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (source) filter.source = source;

  if (search?.trim()) {
    const searchRegex = new RegExp(
      escapeRegex(search.trim().slice(0, 100)),
      "i"
    );

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
    ];
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize),

    Lead.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: leads.length,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    leads,
  });
});

// Get single lead
export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    lead,
  });
});

// Create lead
export const createLead = asyncHandler(async (req, res) => {
  const result = leadCreateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const lead = await Lead.create({
    ...result.data,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Lead created successfully",
    lead,
  });
});

// Update lead
export const updateLead = asyncHandler(async (req, res) => {
  const result = leadUpdateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const lead = await Lead.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    {
      $set: result.data,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    lead,
  });
});

// Delete lead
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    message: "Lead deleted successfully",
  });
});

// Reorder leads
export const reorderLeads = asyncHandler(async (req, res) => {
  const result = reorderLeadsSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const { updates } = result.data;

  // Ensure all requested leads belong to the authenticated user
  const leadIds = updates.map((item) => item.id);

  const existingLeads = await Lead.countDocuments({
    _id: { $in: leadIds },
    owner: req.user._id,
  });

  if (existingLeads !== leadIds.length) {
    throw new ApiError(404, "One or more leads were not found");
  }

  // Apply validated updates
  await Lead.bulkWrite(
    updates.map((item) => ({
      updateOne: {
        filter: {
          _id: item.id,
          owner: req.user._id,
        },
        update: {
          $set: {
            status: item.status,
            order: item.order,
          },
        },
      },
    }))
  );

  res.status(200).json({
    success: true,
    message: "Pipeline updated successfully",
  });
});
