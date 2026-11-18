
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: false,
    },

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
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) =>
          tags.length <= 20 &&
          tags.every(
            (tag) => tag.trim().length > 0 && tag.length <= 30
          ),
        message: "Maximum 20 tags allowed, each up to 30 characters",
      },
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

contactSchema.index({ owner: 1, createdAt: -1 });

contactSchema.index(
  { name: "text", email: "text", company: "text" },
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
