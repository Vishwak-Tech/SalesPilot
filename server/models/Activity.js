
import mongoose from "mongoose";

export const ACTIVITY_TYPES = [
  "lead_created",
  "lead_updated",
  "lead_status_changed",
  "contact_created",
  "contact_updated",
  "task_created",
  "task_completed",
  "note_created",
];

const activitySchema = new mongoose.Schema(
  {
    // User who owns the activity
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Activity category
    type: {
      type: String,
      required: [true, "Activity type is required"],
      enum: ACTIVITY_TYPES,
    },

    // Human-readable activity description
    description: {
      type: String,
      required: [true, "Activity description is required"],
      trim: true,
      maxlength: 500,
    },

    // Optional relationship with CRM resources
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // Additional event-specific information
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Owner-scoped activity timeline
activitySchema.index({ owner: 1, createdAt: -1 });

// Activity history for individual leads
activitySchema.index({ owner: 1, lead: 1, createdAt: -1 });

// Activity history for individual contacts
activitySchema.index({ owner: 1, contact: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
