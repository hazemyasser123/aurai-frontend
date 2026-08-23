import { z } from "zod";

const emailListSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const emails = val
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      if (emails.length === 0) return true;
      const emailSchema = z.string().email();
      return emails.every((email) => emailSchema.safeParse(email).success);
    },
    {
      message: "Please enter valid email addresses, separated by commas.",
    },
  );

export const createBatchSchema = z.object({
  base_product_id: z.string().min(1, "Base product is required"),
  batch_name: z.string().min(3, "Batch name must be at least 3 characters"),
  max_results: z.coerce
    .number()
    .min(1, "Must be at least 1")
    .max(1000, "Maximum 1000 results"),
  batch_description: z.string().optional(),

  cc_emails: emailListSchema,
  bcc_emails: emailListSchema,
  human_action_loop_emails: emailListSchema,

  // Changed from forward_email to forward_emails to match state and payload
  forward_emails: emailListSchema,

  enable_auto_followup: z.boolean().default(true),
  followup_delay_days: z.coerce
    .number()
    .min(1, "Must be at least 1 day")
    .default(5),
});

export type CreateBatchFormData = z.infer<typeof createBatchSchema>;

export const addManualContactSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  title: z.string().trim().max(100, "Title too long").optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Please enter a valid email address",
    }),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\+?[0-9\s\-()]{7,20}$/.test(v), {
      message: "Please enter a valid phone number (7-20 digits, may include + - ( ) and spaces)",
    }),
  linkedin_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().url().safeParse(v).success, {
      message: "Please enter a valid URL (https://...)",
    })
    .refine((v) => !v || /linkedin\.com\/in\//i.test(v), {
      message: "LinkedIn URL must contain linkedin.com/in/",
    }),
});

export type AddManualContactFormData = z.infer<typeof addManualContactSchema>;
