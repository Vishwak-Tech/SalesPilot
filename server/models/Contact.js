
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    // Contact ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic contact information
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 254,
      match: [
        /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email",
      ],
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

    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // Organization
    tags: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Owner-scoped contact listing
contactSchema.index({ owner: 1, createdAt: -1 });

// Weighted full-text search
contactSchema.index(
  {
    name: "text",
    email: "text",
    company: "text",
  },
  {
    weights: {
      name: 10,
      email: 5,
      company: 3,
    },
    name: "contact_text_search",
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
