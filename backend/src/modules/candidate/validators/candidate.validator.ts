import { z } from 'zod';

export const bookmarkQuerySchema = z.object({
  page: z.coerce.number().int().positive('Page must be positive').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be positive').optional().default(10),
});

export const candidateApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive('Page must be positive').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be positive').optional().default(10),
  status: z.enum(['Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'], {
    message: "Status must be 'Applied', 'Shortlisted', 'Interviewed', 'Rejected', or 'Hired'",
  }).optional(),
});
