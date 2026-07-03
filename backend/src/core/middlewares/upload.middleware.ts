import multer from 'multer';
import { BadRequestError } from '../errors/AppError.js';

// Setup memory storage to hold files in buffer directly (avoid local server writes)
const storage = multer.memoryStorage();

// File filter to restrict uploads to PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only PDF files are allowed!') as any, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
});

export default upload;
