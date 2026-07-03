import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import CandidateService from '../../candidate/services/candidate.service';
import RecruiterService from '../../recruiter/services/recruiter.service';
import { BadRequestError } from '../../../core/errors/AppError';

export class AuthController {
  private authService: AuthService;
  private candidateService: CandidateService;
  private recruiterService: RecruiterService;

  constructor() {
    this.authService = new AuthService();
    this.candidateService = new CandidateService();
    this.recruiterService = new RecruiterService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.authService.login(req.body);
      res.status(200).json({
        status: 'success',
        data: { user, accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const user = await this.authService.getProfile(userId);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const role = req.user!.role;
      let user;

      if (role === 'Candidate') {
        user = await this.candidateService.updateProfile(userId, req.body);
      } else if (role === 'Recruiter') {
        user = await this.recruiterService.updateProfile(userId, req.body);
      } else {
        user = await this.authService.updateProfile(userId, req.body);
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refresh(refreshToken);
      res.status(200).json({
        status: 'success',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      await this.authService.logout(userId);
      res.status(200).json({
        status: 'success',
        message: 'Successfully logged out',
      });
    } catch (error) {
      next(error);
    }
  };

  uploadResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('Please upload a PDF file');
      }

      const userId = req.user!.sub;
      const secureUrl = await this.candidateService.uploadResume(userId, req.file.buffer);
      const user = await this.authService.getProfile(userId);

      res.status(200).json({
        status: 'success',
        data: {
          resumeUrl: secureUrl,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.forgotPassword(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to your email address',
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.resetPassword(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
