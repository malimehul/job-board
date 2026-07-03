import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import User from '../../modules/auth/models/user.model';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Access token is missing or invalid'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    // Check if the user exists and still has an active session (refreshToken is present)
    const user = await User.findById(decoded.sub);
    if (!user || !user.refreshToken) {
      next(new UnauthorizedError('User session has expired or logged out'));
      return;
    }

    if (user.status === 'suspended') {
      next(new UnauthorizedError('Your account has been suspended'));
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};

export const authorizeRoles = (...roles: Array<'Candidate' | 'Recruiter' | 'Admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to access this resource'));
      return;
    }

    next();
  };
};
