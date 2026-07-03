import { Request, Response, NextFunction } from 'express';
import ApplicationService from '../services/application.service.js';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.sub;
      const application = await this.applicationService.applyForJob(candidateId, req.body);
      res.status(201).json({
        status: 'success',
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  };

  getMyApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.sub;
      const applications = await this.applicationService.getCandidateApplications(candidateId);
      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  };

  getJobApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.jobId as string;
      const recruiterId = req.user!.sub;
      const applications = await this.applicationService.getJobApplications(jobId, recruiterId);
      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationId = req.params.id as string;
      const recruiterId = req.user!.sub;
      const { status } = req.body;
      const application = await this.applicationService.updateStatus(applicationId, recruiterId, status);
      res.status(200).json({
        status: 'success',
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applications = await this.applicationService.getAllApplications();
      res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ApplicationController;
