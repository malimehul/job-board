import { z } from "zod";
import { JOB_TYPES, JobType } from "../constants/job.constants";

/**
 * Zod validation schema for Job creation and editing forms.
 */
export const jobFormSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters").max(100),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  skills: z.string().min(1, "Please enter at least one skill"),
  salaryMin: z.number({ error: "Minimum salary must be a number" }).nonnegative("Minimum salary must be non-negative"),
  salaryMax: z.number({ error: "Maximum salary must be a number" }).nonnegative("Maximum salary must be non-negative"),
  experienceMin: z.number({ error: "Minimum experience must be a number" }).nonnegative("Minimum experience must be non-negative"),
  experienceMax: z.number({ error: "Maximum experience must be a number" }).nonnegative("Maximum experience must be non-negative"),
  jobType: z.enum(JOB_TYPES, {
    message: "Please select a valid job type",
  }),
  location: z.string().min(1, "Location is required"),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
}).refine((data) => data.salaryMax >= data.salaryMin, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salaryMax"],
}).refine((data) => data.experienceMax >= data.experienceMin, {
  message: "Maximum experience must be greater than or equal to minimum experience",
  path: ["experienceMax"],
});

export type JobFormInput = z.infer<typeof jobFormSchema>;

export interface JobPayload {
  title: string;
  description: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  jobType: JobType;
  location: string;
  applicationDeadline: string;
}

export default jobFormSchema;
