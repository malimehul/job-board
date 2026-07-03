import { Router } from 'express';
import ApplicationController from '../controllers/application.controller.js';
import validate from '../../../core/middlewares/validation.middleware.js';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware.js';
import { createApplicationSchema, updateApplicationStatusSchema } from '../validators/application.validator.js';

const router = Router();
const controller = new ApplicationController();

// Apply for a job - Only Candidate
router.post('/', authenticate, authorizeRoles('Candidate'), validate(createApplicationSchema), controller.apply);

// Candidate's own applications - Only Candidate
router.get('/my', authenticate, authorizeRoles('Candidate'), controller.getMyApplications);

// Update application status - Only Recruiter
router.patch('/:id/status', authenticate, authorizeRoles('Recruiter'), validate(updateApplicationStatusSchema), controller.updateStatus);

export default router;
