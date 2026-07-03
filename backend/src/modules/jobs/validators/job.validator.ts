import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title must be at least 2 characters').max(100),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  skills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one skill is required'),
  salaryMin: z.number().nonnegative('Minimum salary must be non-negative'),
  salaryMax: z.number().nonnegative('Maximum salary must be non-negative'),
  experienceMin: z.number().nonnegative('Minimum experience must be non-negative'),
  experienceMax: z.number().nonnegative('Maximum experience must be non-negative'),
  jobType: z.string().min(1, 'Job type is required'),
  location: z.string().min(1, 'Location is required'),
  applicationDeadline: z.coerce.date({
    message: 'Invalid application deadline date format',
  }),
}).refine((data) => data.salaryMax >= data.salaryMin, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax'],
}).refine((data) => data.experienceMax >= data.experienceMin, {
  message: 'Maximum experience must be greater than or equal to minimum experience',
  path: ['experienceMax'],
});

export const updateJobSchema = z.object({
  title: z.string().min(2, 'Job title must be at least 2 characters').max(100).optional(),
  description: z.string().min(10, 'Job description must be at least 10 characters').optional(),
  skills: z.array(z.string().min(1)).min(1).optional(),
  salaryMin: z.number().nonnegative('Minimum salary must be non-negative').optional(),
  salaryMax: z.number().nonnegative('Maximum salary must be non-negative').optional(),
  experienceMin: z.number().nonnegative('Minimum experience must be non-negative').optional(),
  experienceMax: z.number().nonnegative('Maximum experience must be non-negative').optional(),
  jobType: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  applicationDeadline: z.coerce.date().optional(),
  status: z.enum(['open', 'closed']).optional(),
}).refine((data) => {
  if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax'],
}).refine((data) => {
  if (data.experienceMin !== undefined && data.experienceMax !== undefined) {
    return data.experienceMax >= data.experienceMin;
  }
  return true;
}, {
  message: 'Maximum experience must be greater than or equal to minimum experience',
  path: ['experienceMax'],
});
