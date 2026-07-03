import { z } from 'zod';

export const jobSearchQuerySchema = z.object({
  page: z.coerce.number().int().positive('Page must be positive').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be positive').optional().default(10),
  keyword: z.string().trim().optional(),
  skills: z.string().trim().optional(),
  location: z.string().trim().optional(),
  jobType: z.string().trim().optional(),
  salaryMin: z.coerce.number().nonnegative('Minimum salary must be non-negative').optional(),
  salaryMax: z.coerce.number().nonnegative('Maximum salary must be non-negative').optional(),
  sortBy: z.string().trim().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'], {
    message: "Sort order must be 'asc' or 'desc'",
  }).optional().default('desc'),
  status: z.enum(['open', 'closed']).optional(),
  recruiterId: z.string().trim().optional(),
  hasApplications: z.string().trim().optional(),
});
