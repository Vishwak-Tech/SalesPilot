
import { Router } from "express";

import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

export default router;
