
import { z } from "zod";

// Lead enums
const leadStatus = z.enum([
  "New",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
]);

const leadPriority = z.enum([
  "Low",
  "Medium",
  "High",
]);

const leadSource = z.enum([
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
]);

// Reusable lead fields
const leadFields = {
  name: z
    .string()
    .trim()
    .min(2, "Lead name must contain at least 2 characters")
    .max(100, "Lead name cannot exceed 100 characters"),

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

  status: leadStatus,

  priority: leadPriority,

  source: leadSource,

  value: z
    .number()
    .finite()
    .min(0, "Lead value cannot be negative"),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters"),

  tags: z
    .array(
      z.string()
        .trim()
        .min(1, "Tags cannot be empty")
        .max(30, "Each tag cannot exceed 30 characters")
    )
    .max(20, "A lead cannot have more than 20 tags"),
};

// Create lead
export const leadCreateSchema = z.object({
  name: leadFields.name,
  email: leadFields.email.optional(),
  phone: leadFields.phone.optional(),
  company: leadFields.company.optional(),
  status: leadFields.status.optional(),
  priority: leadFields.priority.optional(),
  source: leadFields.source.optional(),
  value: leadFields.value.optional(),
  notes: leadFields.notes.optional(),
  tags: leadFields.tags.optional(),
}).strict();

// Update lead
export const leadUpdateSchema = z.object({
  name: leadFields.name.optional(),
  email: leadFields.email.optional(),
  phone: leadFields.phone.optional(),
  company: leadFields.company.optional(),
  status: leadFields.status.optional(),
  priority: leadFields.priority.optional(),
  source: leadFields.source.optional(),
  value: leadFields.value.optional(),
  notes: leadFields.notes.optional(),
  tags: leadFields.tags.optional(),
})
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

// Reorder pipeline
export const reorderLeadsSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid lead ID"
      ),
      status: leadStatus,
      order: z.number().int().min(0, "Order cannot be negative"),
    }).strict()
  )
    .min(1, "At least one lead update is required")
    .max(100, "Cannot reorder more than 100 leads at once"),
})
  .strict()
  .refine(
    (data) => {
      const ids = data.updates.map((item) => item.id);
      return new Set(ids).size === ids.length;
    },
    "Duplicate lead IDs are not allowed"
  );
