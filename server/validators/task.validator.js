
import { z } from "zod";

// Reusable validations
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

const taskStatuses = [
  "Pending",
  "In Progress",
  "Completed",
];

const taskPriorities = [
  "Low",
  "Medium",
  "High",
];

const taskFields = {
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Task title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters"),

  dueDate: z
    .string()
    .datetime({ offset: true })
    .nullable(),

  status: z.enum(taskStatuses),

  priority: z.enum(taskPriorities),

  relatedLead: objectIdSchema.nullable(),

  relatedContact: objectIdSchema.nullable(),
};

// Ensure a task is linked to at most one CRM record
const validateRelationship = (data) =>
  !(data.relatedLead && data.relatedContact);

// Create task
export const taskCreateSchema = z
  .object({
    title: taskFields.title,
    description: taskFields.description.optional(),
    dueDate: taskFields.dueDate.optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    relatedLead: taskFields.relatedLead.optional(),
    relatedContact: taskFields.relatedContact.optional(),
  })
  .strict()
  .refine(validateRelationship, {
    message: "A task cannot be linked to both a lead and a contact",
    path: ["relatedContact"],
  });

// Update task
export const taskUpdateSchema = z
  .object({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    dueDate: taskFields.dueDate.optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
    relatedLead: taskFields.relatedLead.optional(),
    relatedContact: taskFields.relatedContact.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  )
  .refine(validateRelationship, {
    message: "A task cannot be linked to both a lead and a contact",
    path: ["relatedContact"],
  });

// Complete or reopen task
export const taskCompletionSchema = z
  .object({
    status: z.enum(taskStatuses),
  })
  .strict();

// Query validation
export const taskQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    relatedLead: objectIdSchema.optional(),
    relatedContact: objectIdSchema.optional(),
    page: z.string().regex(/^[1-9]\d*$/, "Invalid page number").optional(),
    limit: z.string().regex(/^[1-9]\d*$/, "Invalid page limit").optional(),
    sort: z.enum(["dueDate", "createdAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  })
  .strict()
  .refine(
    (data) => !(data.relatedLead && data.relatedContact),
    {
      message: "Filter by either a lead or a contact, not both",
    }
  );
