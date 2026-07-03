import { Router } from 'express';
import JobController from '../controllers/job.controller.js';
import ApplicationController from '../../applications/controllers/application.controller.js';
import validate from '../../../core/middlewares/validation.middleware.js';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware.js';
import { createJobSchema, updateJobSchema } from '../validators/job.validator.js';
import { jobSearchQuerySchema } from '../validators/job.query.validator.js';

const router = Router();
const controller = new JobController();
const applicationController = new ApplicationController();

// Search jobs with queries - Public guest access
router.get('/', validate(jobSearchQuerySchema, 'query'), controller.search);

// Create a new job - Only Recruiter
router.post('/', authenticate, authorizeRoles('Recruiter'), validate(createJobSchema), controller.create);

// Get logged-in recruiter's jobs - Only Recruiter (declared before /:id to prevent overlap)
router.get('/my-jobs', authenticate, authorizeRoles('Recruiter'), validate(jobSearchQuerySchema, 'query'), controller.getMyJobs);

// Get applications for a specific job - Only Recruiter
router.get('/:jobId/applications', authenticate, authorizeRoles('Recruiter'), applicationController.getJobApplications);

// Get a specific job's details - Public guest access
router.get('/:id', controller.getJobById);

// Update a specific job - Only Recruiter
router.put('/:id', authenticate, authorizeRoles('Recruiter'), validate(updateJobSchema), controller.updateJob);

// Delete a specific job - Only Recruiter
router.delete('/:id', authenticate, authorizeRoles('Recruiter'), controller.deleteJob);

// Close a job - Only Recruiter
router.patch('/:id/close', authenticate, authorizeRoles('Recruiter'), controller.closeJob);

// Reopen a job - Only Recruiter
router.patch('/:id/reopen', authenticate, authorizeRoles('Recruiter'), controller.reopenJob);

export default router;
