import { Router } from 'express';
import multer from 'multer';
import CandidateController from '../controllers/candidate.controller.js';
import validate from '../../../core/middlewares/validation.middleware.js';
import { authenticate, authorizeRoles } from '../../../core/middlewares/auth.middleware.js';
import { bookmarkQuerySchema, candidateApplicationsQuerySchema } from '../validators/candidate.validator.js';
import { updateProfileSchema } from '../../auth/validators/auth.validator.js';

const router = Router();
const controller = new CandidateController();

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return callback(new Error('Please upload a PDF file'));
    }
    callback(null, true);
  },
});

// Bookmark/Save a job - Only Candidate
router.post('/jobs/:jobId/bookmark', authenticate, authorizeRoles('Candidate'), controller.bookmark);

// Remove a bookmarked job - Only Candidate
router.delete('/jobs/:jobId/bookmark', authenticate, authorizeRoles('Candidate'), controller.unbookmark);

// Get bookmarked jobs list - Only Candidate
router.get('/bookmarks', authenticate, authorizeRoles('Candidate'), validate(bookmarkQuerySchema, 'query'), controller.getBookmarks);

// Candidate Application tracking list - Only Candidate
router.get('/applications', authenticate, authorizeRoles('Candidate'), validate(candidateApplicationsQuerySchema, 'query'), controller.getApplications);

// Candidate Dashboard stats - Only Candidate
router.get('/dashboard', authenticate, authorizeRoles('Candidate'), controller.getDashboard);

// Update candidate profile skills/experience - Only Candidate
router.put('/profile', authenticate, authorizeRoles('Candidate'), validate(updateProfileSchema), controller.updateProfile);

// Upload candidate resume - Only Candidate
router.post('/upload-resume', authenticate, authorizeRoles('Candidate'), upload.single('resume'), controller.uploadResume);

export default router;
