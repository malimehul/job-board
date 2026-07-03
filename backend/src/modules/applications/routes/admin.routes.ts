import { Router } from 'express';
import ApplicationController from '../controllers/application.controller.js';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware.js';

const router = Router();
const controller = new ApplicationController();

// Admin views all applications - Only Admin
router.get('/', authenticate, authorizeRoles('Admin'), controller.getAllApplications);

export default router;
