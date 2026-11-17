
import { Router } from "express";

import {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  toggleContactFavorite,
} from "../controllers/contact.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All contact routes require authentication
router.use(protect);

// List and create contacts
router.route("/")
  .get(getContacts)
  .post(createContact);

// Favorite status
router.patch("/:id/favorite", toggleContactFavorite);

// Individual contact operations
router.route("/:id")
  .get(getContact)
  .patch(updateContact)
  .delete(deleteContact);

export default router;
