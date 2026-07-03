import { z } from "zod";

/**
 * Zod validation schema for Candidate profile details forms.
 * Enforces title length, name constraints, non-negative experience, and bio lengths.
 */
export const candidateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Professional title must be at least 2 characters").optional().or(z.literal("")),
  experience: z.number({ error: "Years of experience must be a number" }).nonnegative("Experience cannot be negative").optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional().or(z.literal("")),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export default candidateProfileSchema;
