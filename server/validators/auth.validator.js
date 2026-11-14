
import { z } from "zod";

// Register validation
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),

  company: z
    .string()
    .trim()
    .max(100, "Company name cannot exceed 100 characters")
    .optional()
    .default(""),
}).strict();

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Invalid password"),
}).strict();

// Profile update validation
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  company: z
    .string()
    .trim()
    .max(100, "Company name cannot exceed 100 characters")
    .optional(),

  avatar: z
    .string()
    .trim()
    .url("Please provide a valid avatar URL")
    .or(z.literal(""))
    .optional(),
})
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

// Change password validation
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required")
    .max(72, "Invalid password"),

  newPassword: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
})
  .strict()
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }
  );
