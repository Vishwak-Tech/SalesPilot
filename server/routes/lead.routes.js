
import { Router } from "express";

import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  reorderLeads,
} from "../controllers/lead.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

// List and create
router.get("/", getLeads);
router.post("/", createLead);

// Pipeline operations — before /:id
router.patch("/reorder", reorderLeads);

// Individual lead operations
router.get("/:id", getLead);
router.patch("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
