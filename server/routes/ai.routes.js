
import { Router } from "express";

import {
  generateLeadAnalysis,
  generateLeadEmail,
  getSalesInsights,
} from "../controllers/ai.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All AI endpoints require authentication.
router.use(protect);

router.post(
  "/leads/:id/summary",
  generateLeadAnalysis
);

router.post(
  "/leads/:id/email",
  generateLeadEmail
);

router.post(
  "/sales-insights",
  getSalesInsights
);

export default router;
