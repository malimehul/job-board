import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import validate from '../../../core/middlewares/validation.middleware.js';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware.js';
import { upload } from '../../../core/middlewares/upload.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.post('/upload-resume', authenticate, authorizeRoles('Candidate', 'Admin'), upload.single('resume'), controller.uploadResume);
router.get('/me', authenticate, controller.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

export default router;
