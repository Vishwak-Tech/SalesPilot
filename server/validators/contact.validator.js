
import { z } from "zod";

// Reusable contact field validations
const contactFields = {
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .max(254, "Email cannot exceed 254 characters")
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase())
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(25, "Phone number cannot exceed 25 characters"),

  company: z
    .string()
    .trim()
    .max(100, "Company name cannot exceed 100 characters"),

  title: z
    .string()
    .trim()
    .max(100, "Job title cannot exceed 100 characters"),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tags cannot be empty")
        .max(30, "Each tag cannot exceed 30 characters")
    )
    .max(20, "Maximum 20 tags are allowed"),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters"),

  favorite: z.boolean(),
};

// Create contact
export const contactCreateSchema = z
  .object({
    name: contactFields.name,
    email: contactFields.email.optional(),
    phone: contactFields.phone.optional(),
    company: contactFields.company.optional(),
    title: contactFields.title.optional(),
    tags: contactFields.tags.optional(),
    notes: contactFields.notes.optional(),
    favorite: contactFields.favorite.optional(),
  })
  .strict();

// Update contact
export const contactUpdateSchema = z
  .object({
    name: contactFields.name.optional(),
    email: contactFields.email.optional(),
    phone: contactFields.phone.optional(),
    company: contactFields.company.optional(),
    title: contactFields.title.optional(),
    tags: contactFields.tags.optional(),
    notes: contactFields.notes.optional(),
    favorite: contactFields.favorite.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

// Update favorite status
export const contactFavoriteSchema = z
  .object({
    favorite: contactFields.favorite,
  })
  .strict();
