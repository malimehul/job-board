import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import validate from '../../../core/middlewares/validation.middleware.js';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware.js';
import {
  userQuerySchema,
  jobQuerySchema,
  applicationQuerySchema,
  analyticsQuerySchema,
} from '../validators/admin.validator.js';

const router = Router();
const controller = new AdminController();

// Admin Dashboard stats - Only Admin
router.get('/dashboard', authenticate, authorizeRoles('Admin'), validate(analyticsQuerySchema, 'query'), controller.getDashboard);

// User management list - Only Admin
router.get('/users', authenticate, authorizeRoles('Admin'), validate(userQuerySchema, 'query'), controller.getUsers);

// Suspend a user - Only Admin
router.patch('/users/:id/suspend', authenticate, authorizeRoles('Admin'), controller.suspendUser);

// Activate a user - Only Admin
router.patch('/users/:id/activate', authenticate, authorizeRoles('Admin'), controller.activateUser);

// Job management read-only list - Only Admin
router.get('/jobs', authenticate, authorizeRoles('Admin'), validate(jobQuerySchema, 'query'), controller.getJobs);

// Application management read-only list - Only Admin
router.get('/applications', authenticate, authorizeRoles('Admin'), validate(applicationQuerySchema, 'query'), controller.getApplications);

// Analytics jobs posted - Only Admin
router.get('/analytics/jobs', authenticate, authorizeRoles('Admin'), validate(analyticsQuerySchema, 'query'), controller.getJobsAnalytics);

// Analytics applications - Only Admin
router.get('/analytics/applications', authenticate, authorizeRoles('Admin'), validate(analyticsQuerySchema, 'query'), controller.getApplicationsAnalytics);

// Analytics top recruiters - Only Admin
router.get('/analytics/top-recruiters', authenticate, authorizeRoles('Admin'), controller.getTopRecruiters);

export default router;
