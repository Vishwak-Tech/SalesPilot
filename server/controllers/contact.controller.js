
import Contact from "../models/Contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { contactCreateSchema } from "../validators/contact.validator.js";

export const createContact = asyncHandler(async (req, res) => {
  // 1. Validate incoming request data
  const result = contactCreateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  // 2. Create contact and assign authenticated user as owner
  const contact = await Contact.create({
    ...result.data,
    owner: req.user._id,
  });

  // 3. Send response
  res.status(201).json({
    success: true,
    message: "Contact created successfully",
    contact,
  });
});

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getContacts = asyncHandler(async (req, res) => {
  const {
    search,
    favorite,
    page = "1",
    limit = "20",
  } = req.query;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  // Always restrict contacts to the authenticated user
  const filter = {
    owner: req.user._id,
  };

  // Search by name, email, or company
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

  // Filter favorite contacts
  if (favorite === "true") {
    filter.favorite = true;
  } else if (favorite === "false") {
    filter.favorite = false;
  }

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize),

    Contact.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: contacts.length,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    contacts,
  });
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    contact,
  });
});


import { contactUpdateSchema } from "../validators/contact.validator.js";

export const updateContact = asyncHandler(async (req, res) => {
  const result = contactUpdateSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const contact = await Contact.findOneAndUpdate(
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

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    contact,
  });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});

import { contactFavoriteSchema } from "../validators/contact.validator.js";

export const toggleContactFavorite = asyncHandler(async (req, res) => {
  const result = contactFavoriteSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const contact = await Contact.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id,
    },
    {
      $set: { favorite: result.data.favorite },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    message: "Favorite status updated successfully",
    contact,
  });
});