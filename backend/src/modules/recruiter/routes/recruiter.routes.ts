import { Router } from 'express';
import RecruiterController from '../controllers/recruiter.controller';
import validate from '../../../core/middlewares/validation.middleware';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware';
import { updateRecruiterProfileSchema } from '../validators/recruiter.validator';

const router = Router();
const controller = new RecruiterController();

// Recruiter Dashboard stats - Only Recruiter
router.get('/dashboard', authenticate, authorizeRoles('Recruiter'), controller.getDashboard);

// Update recruiter profile company details - Only Recruiter
router.put('/profile', authenticate, authorizeRoles('Recruiter'), validate(updateRecruiterProfileSchema), controller.updateProfile);

export default router;
