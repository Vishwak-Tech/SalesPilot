
import mongoose from "mongoose";

import Task from "../models/Task.js";
import Lead from "../models/Lead.js";
import Contact from "../models/Contact.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import {
  taskCreateSchema,
  taskUpdateSchema,
  taskCompletionSchema,
  taskQuerySchema,
} from "../validators/task.validator.js";

// Escape special regex characters in search input
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Validate MongoDB IDs
const validateObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid MongoDB ID");
  }
};

// Verify ownership of linked Lead and Contact
const validateRelationships = async (data, ownerId) => {
  if (data.relatedLead) {
    const lead = await Lead.findOne({
      _id: data.relatedLead,
      owner: ownerId,
    }).select("_id");

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }
  }

  if (data.relatedContact) {
    const contact = await Contact.findOne({
      _id: data.relatedContact,
      owner: ownerId,
    }).select("_id");

    if (!contact) {
      throw new ApiError(404, "Contact not found");
    }
  }
};

// Manage completion timestamp based on status
const getCompletionFields = (status) => ({
  completedAt: status === "Completed" ? new Date() : null,
});

// 1. Create a task
export const createTask = asyncHandler(async (req, res) => {
  const result = taskCreateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const { relatedLead, relatedContact, status } = result.data;

  // Prevent linking a task to both a lead and a contact
  if (relatedLead && relatedContact) {
    throw new ApiError(
      400,
      "A task cannot be linked to both a lead and a contact"
    );
  }

  // Verify ownership of linked records
  await validateRelationships(
    { relatedLead, relatedContact },
    req.user._id
  );

  const task = await Task.create({
    ...result.data,
    ...getCompletionFields(status ?? "Pending"),
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});

// 2. Get all tasks with filters, search, and pagination
export const getTasks = asyncHandler(async (req, res) => {
  const result = taskQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const {
    search,
    status,
    priority,
    relatedLead,
    relatedContact,
    page = "1",
    limit = "20",
    sort = "createdAt",
    order = "desc",
  } = result.data;

  const currentPage = Number(page);
  const pageSize = Math.min(100, Number(limit));

  const filter = {
    owner: req.user._id,
  };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (relatedLead) filter.relatedLead = relatedLead;
  if (relatedContact) filter.relatedContact = relatedContact;

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
    ];
  }

  const sortDirection = order === "asc" ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({
        [sort]: sortDirection,
        _id: -1,
      })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .populate("relatedLead", "name company")
      .populate("relatedContact", "name company"),

    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    tasks,
  });
});

// 3. Get an individual task
export const getTask = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  })
    .populate("relatedLead", "name company")
    .populate("relatedContact", "name company");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    success: true,
    task,
  });
});

// 4. Update a task
export const updateTask = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const result = taskUpdateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const {
    relatedLead,
    relatedContact,
    status,
  } = result.data;

  // Determine the final relationship state.
  // Omitted fields preserve existing relationships.
  // Explicit null clears the corresponding relationship.
  let updatedLead =
    relatedLead !== undefined
      ? relatedLead
      : task.relatedLead;

  let updatedContact =
    relatedContact !== undefined
      ? relatedContact
      : task.relatedContact;

  // Switching to a lead clears the existing contact.
  if (relatedLead) {
    updatedContact = null;
  }

  // Switching to a contact clears the existing lead.
  if (relatedContact) {
    updatedLead = null;
  }

  // Validate the final relationship state.
  if (updatedLead && updatedContact) {
    throw new ApiError(
      400,
      "A task cannot be linked to both a lead and a contact"
    );
  }

  // Verify ownership of the final linked records.
  await validateRelationships(
    {
      relatedLead: updatedLead,
      relatedContact: updatedContact,
    },
    req.user._id
  );

  // Preserve the previous status before applying updates.
  const previousStatus = task.status;

  // Apply regular task updates.
  Object.assign(task, result.data);

  // Apply the resolved relationship state.
  task.relatedLead = updatedLead ?? null;
  task.relatedContact = updatedContact ?? null;

  // Update completion timestamp only when status changes.
  if (status !== undefined) {
    if (status === "Completed") {
      if (previousStatus !== "Completed") {
        task.completedAt = new Date();
      }
    } else {
      task.completedAt = null;
    }
  }

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task,
  });
});

// 5. Delete a task
export const deleteTask = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

// 6. Update task completion status
export const updateTaskCompletion = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const result = taskCompletionSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const newStatus = result.data.status;

  // Preserve original completion timestamp if already completed.
  if (newStatus === "Completed") {
    if (task.status !== "Completed") {
      task.completedAt = new Date();
    }
  } else {
    task.completedAt = null;
  }

  task.status = newStatus;

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task status updated successfully",
    task,
  });
});
