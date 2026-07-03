import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';
import env from '../config/environment.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Helper to sanitize sensitive fields in log payloads
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = { ...obj };
    for (const key in sanitized) {
      if (key.toLowerCase().includes('password')) {
        sanitized[key] = '*****';
      }
    }
    return sanitized;
  };

  const reqContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    query: req.query,
    body: sanitize(req.body),
    user: req.user ? { id: req.user.sub, role: req.user.role } : 'Unauthenticated',
  };

  // Log the error with request context details
  logger.error(
    `[${reqContext.method}] ${reqContext.url} -\n` +
    `Request Context: ${JSON.stringify(reqContext, null, 2)}\n` +
    `Stack: ${err.stack || `${err.name}: ${err.message}`}`
  );

  // Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Multer Upload Errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      status: 'error',
      message: err.message === 'File too large' ? 'File size exceeds the 5MB limit' : err.message,
    });
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    res.status(400).json({
      status: 'error',
      message: 'Invalid resource ID format',
    });
    return;
  }

  // Unhandled Error
  const isProduction = env.NODE_ENV === 'production';
  res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal Server Error' : err.message,
    ...(!isProduction && { stack: err.stack }),
  });
};

export default errorHandler;
