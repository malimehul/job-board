import { z } from 'zod';

export const createApplicationSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Job ID format'),
  coverLetter: z.string().min(10, 'Cover letter must be at least 10 characters'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'], {
    message: "Status must be 'Applied', 'Shortlisted', 'Interviewed', 'Rejected', or 'Hired'",
  }),
});
