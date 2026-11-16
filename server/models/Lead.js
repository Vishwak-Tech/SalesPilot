import mongoose from "mongoose";

export const LEAD_STATUSES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

const leadSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      minlength: [2, "Lead name must be at least 2 characters"],
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 254,
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 25,
    },

    company: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
    },

    priority: {
      type: String,
      enum: LEAD_PRIORITIES,
      default: "Medium",
    },

    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: "Other",
    },

    value: {
      type: Number,
      default: 0,
      min: [0, "Lead value cannot be negative"],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    tags: {
      type: [String],
      default: [],
    },

    aiSummary: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    aiRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for owner-scoped queries
leadSchema.index({ owner: 1, status: 1 });
leadSchema.index({ owner: 1, createdAt: -1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
