
import mongoose from "mongoose";

import Note from "../models/Note.js";
import Lead from "../models/Lead.js";
import Contact from "../models/Contact.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import {
  noteCreateSchema,
  noteUpdateSchema,
  notePinSchema,
  noteQuerySchema,
} from "../validators/note.validator.js";

// Escape special regex characters in search input
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Validate MongoDB document IDs
const validateObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid MongoDB ID");
  }
};

// Verify that a linked Lead or Contact belongs to the authenticated user
const validateRelationships = async (data, ownerId) => {
  if (data.lead) {
    const lead = await Lead.findOne({
      _id: data.lead,
      owner: ownerId,
    }).select("_id");

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }
  }

  if (data.contact) {
    const contact = await Contact.findOne({
      _id: data.contact,
      owner: ownerId,
    }).select("_id");

    if (!contact) {
      throw new ApiError(404, "Contact not found");
    }
  }
};

// 1. Get all notes with search, filters, and pagination
export const getNotes = asyncHandler(async (req, res) => {
  const result = noteQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const {
    search,
    lead,
    contact,
    pinned,
    page = "1",
    limit = "20",
  } = result.data;

  const currentPage = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(100, parseInt(limit, 10));

  // Always restrict notes to the authenticated user
  const filter = {
    owner: req.user._id,
  };

  // Filter by Lead
  if (lead) {
    filter.lead = lead;
  }

  // Filter by Contact
  if (contact) {
    filter.contact = contact;
  }

  // Filter pinned or unpinned notes
  if (pinned !== undefined) {
    filter.pinned = pinned === "true";
  }

  // Search note content
  if (search) {
    filter.content = {
      $regex: escapeRegex(search),
      $options: "i",
    };
  }

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .sort({ pinned: -1, createdAt: -1, _id: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .populate("lead", "name company")
      .populate("contact", "name company"),

    Note.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: notes.length,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    notes,
  });
});

// 2. Create a new note
export const createNote = asyncHandler(async (req, res) => {
  const result = noteCreateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const { lead, contact } = result.data;

  // Verify ownership of linked records
  await validateRelationships(
    { lead, contact },
    req.user._id
  );

  const note = await Note.create({
    ...result.data,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Note created successfully",
    note,
  });
});

// 3. Get a single note
export const getNote = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const note = await Note.findOne({
    _id: req.params.id,
    owner: req.user._id,
  })
    .populate("lead", "name company")
    .populate("contact", "name company");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  res.status(200).json({
    success: true,
    note,
  });
});

// 4. Update a note
export const updateNote = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const result = noteUpdateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const note = await Note.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // Check the final relationship state, not just the request body
  const updatedLead =
    result.data.lead !== undefined
      ? result.data.lead
      : note.lead;

  const updatedContact =
    result.data.contact !== undefined
      ? result.data.contact
      : note.contact;

  if (updatedLead && updatedContact) {
    throw new ApiError(
      400,
      "A note cannot be linked to both a lead and a contact"
    );
  }

  // Verify ownership of any newly supplied linked records
  await validateRelationships(
    {
      lead: result.data.lead,
      contact: result.data.contact,
    },
    req.user._id
  );

  Object.assign(note, result.data);

  await note.save();

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    note,
  });
});

// 5. Delete a note
export const deleteNote = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});

// 6. Pin or unpin a note
export const toggleNotePin = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const result = notePinSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const note = await Note.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    {
      $set: {
        pinned: result.data.pinned,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  res.status(200).json({
    success: true,
    message: "Note pin status updated successfully",
    note,
  });
});
