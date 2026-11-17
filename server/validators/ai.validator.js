
import { z } from "zod";

// Generate sales email validation.
export const generateEmailSchema = z
  .object({
    purpose: z
      .string()
      .trim()
      .min(3, "Email purpose must contain at least 3 characters.")
      .max(200, "Email purpose cannot exceed 200 characters."),

    tone: z
      .enum([
        "Professional",
        "Friendly",
        "Formal",
        "Persuasive",
        "Casual",
      ])
      .default("Professional"),

    sender: z
      .object({
        name: z
          .string()
          .trim()
          .min(2, "Sender name must contain at least 2 characters.")
          .max(100, "Sender name cannot exceed 100 characters.")
          .optional(),

        company: z
          .string()
          .trim()
          .min(2, "Company name must contain at least 2 characters.")
          .max(100, "Company name cannot exceed 100 characters.")
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
