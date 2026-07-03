import { z } from "zod";

/**
 * Zod validation schema for Recruiter profile details forms.
 * Enforces company website format and name requirements.
 */
export const recruiterProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional().or(z.literal("")),
  companyWebsite: z.union([z.literal(""), z.string().url("Invalid company website URL")]).optional(),
});

export const recruiterOnboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyWebsite: z.union([z.literal(""), z.string().url("Invalid company website URL")]).optional(),
});

export type RecruiterProfileInput = z.infer<typeof recruiterProfileSchema>;
export type RecruiterOnboardingInput = z.infer<typeof recruiterOnboardingSchema>;
export default recruiterProfileSchema;
