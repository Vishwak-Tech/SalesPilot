
import mongoose from "mongoose";

export const TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

export const TASK_PRIORITIES = [
  "Low",
  "Medium",
  "High",
];

const taskSchema = new mongoose.Schema(
  {
    // Task ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Task information
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    // Scheduling
    dueDate: {
      type: Date,
      default: null,
    },

    // Task lifecycle
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "Pending",
    },

    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "Medium",
    },

    // Optional CRM relationships
    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    relatedContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Owner-scoped task listing
taskSchema.index({ owner: 1, dueDate: 1 });

// Filter tasks by status
taskSchema.index({ owner: 1, status: 1 });

// Filter tasks by priority
taskSchema.index({ owner: 1, priority: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
