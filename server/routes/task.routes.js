
import { Router } from "express";

import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskCompletion,
} from "../controllers/task.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All task routes require authentication
router.use(protect);

// List and create tasks
router.route("/")
  .get(getTasks)
  .post(createTask);

// Update task completion status
router.patch("/:id/completion", updateTaskCompletion);

// Individual task operations
router.route("/:id")
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;
