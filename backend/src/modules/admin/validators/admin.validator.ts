import { z } from 'zod';

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive('Page must be positive').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be positive').optional().default(10),
  role: z.enum(['Candidate', 'Recruiter', 'Admin'], {
    message: "Role must be 'Candidate', 'Recruiter', or 'Admin'",
  }).optional(),
  status: z.enum(['active', 'suspended'], {
    message: "Status must be 'active' or 'suspended'",
  }).optional(),
  search: z.string().trim().optional(),
});

export const jobQuerySchema = z.object({
  page: z.coerce.number().int().positive('Page must be positive').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be positive').optional().default(10),
  status: z.enum(['open', 'closed'], {
    message: "Status must be 'open' or 'closed'",
  }).optional(),
  recruiterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Recruiter ID format').optional(),
});

export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().positive('Page must be positive').optional().default(1),
  limit: z.coerce.number().int().positive('Limit must be positive').optional().default(10),
  status: z.enum(['Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'], {
    message: "Status must be 'Applied', 'Shortlisted', 'Interviewed', 'Rejected', or 'Hired'",
  }).optional(),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Job ID format').optional(),
  candidateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Candidate ID format').optional(),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month'], {
    message: "Period must be 'today', 'week', or 'month'",
  }).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
