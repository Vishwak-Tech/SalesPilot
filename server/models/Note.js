
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // Note ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Note content
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      minlength: [1, "Note cannot be empty"],
      maxlength: [10000, "Note cannot exceed 10000 characters"],
    },

    // Optional relationship with a lead
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    // Optional relationship with a contact
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },

    // Pin important notes
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Owner-scoped note listing
noteSchema.index({ owner: 1, createdAt: -1 });

// Fetch notes associated with a lead
noteSchema.index({ owner: 1, lead: 1 });

// Fetch notes associated with a contact
noteSchema.index({ owner: 1, contact: 1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
