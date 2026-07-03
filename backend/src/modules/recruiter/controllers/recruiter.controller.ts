import { Request, Response, NextFunction } from 'express';
import RecruiterService from '../services/recruiter.service.js';

export class RecruiterController {
  private recruiterService: RecruiterService;

  constructor() {
    this.recruiterService = new RecruiterService();
  }

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recruiterId = req.user!.sub;
      const stats = await this.recruiterService.getDashboard(recruiterId);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recruiterId = req.user!.sub;
      const user = await this.recruiterService.updateProfile(recruiterId, req.body);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default RecruiterController;
