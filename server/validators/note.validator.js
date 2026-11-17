
import { z } from "zod";

// MongoDB ObjectId validation
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

// Reusable note field validations
const noteFields = {
  content: z
    .string()
    .trim()
    .min(1, "Note content is required")
    .max(10000, "Note cannot exceed 10000 characters"),

  lead: objectIdSchema.nullable(),

  contact: objectIdSchema.nullable(),

  pinned: z.boolean(),
};

// Ensure a note is linked to at most one entity
const validateRelationship = (data) => {
  return !(data.lead && data.contact);
};

// Create note
export const noteCreateSchema = z
  .object({
    content: noteFields.content,
    lead: noteFields.lead.optional(),
    contact: noteFields.contact.optional(),
    pinned: noteFields.pinned.optional(),
  })
  .strict()
  .refine(validateRelationship, {
    message: "A note cannot be linked to both a lead and a contact",
    path: ["contact"],
  });

// Update note
export const noteUpdateSchema = z
  .object({
    content: noteFields.content.optional(),
    lead: noteFields.lead.optional(),
    contact: noteFields.contact.optional(),
    pinned: noteFields.pinned.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  )
  .refine(validateRelationship, {
    message: "A note cannot be linked to both a lead and a contact",
    path: ["contact"],
  });

// Update pinned status
export const notePinSchema = z
  .object({
    pinned: noteFields.pinned,
  })
  .strict();

export const noteQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    lead: objectIdSchema.optional(),
    contact: objectIdSchema.optional(),
    pinned: z.enum(["true", "false"]).optional(),
    page: z.string().regex(/^[1-9]\d*$/).optional(),
    limit: z.string().regex(/^[1-9]\d*$/).optional(),
  })
  .strict()
  .refine(
    (data) => !(data.lead && data.contact),
    "Filter by either lead or contact, not both"
  );
