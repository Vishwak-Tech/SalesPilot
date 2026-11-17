
import { Router } from "express";

import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  toggleNotePin,
} from "../controllers/note.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All note routes require authentication
router.use(protect);

// List and create notes
router.route("/")
  .get(getNotes)
  .post(createNote);

// Pin or unpin a note
router.patch("/:id/pin", toggleNotePin);

// Individual note operations
router.route("/:id")
  .get(getNote)
  .patch(updateNote)
  .delete(deleteNote);

export default router;
