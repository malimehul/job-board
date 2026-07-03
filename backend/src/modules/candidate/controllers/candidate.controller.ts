import { Request, Response, NextFunction } from 'express';
import CandidateService from '../services/candidate.service';
import { BadRequestError } from '../../../core/errors/AppError';

export class CandidateController {
  private candidateService: CandidateService;

  constructor() {
    this.candidateService = new CandidateService();
  }

  bookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.jobId as string;
      const candidateId = req.user!.sub;
      await this.candidateService.bookmarkJob(candidateId, jobId);
      res.status(200).json({
        status: 'success',
        message: 'Job bookmarked successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  unbookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.jobId as string;
      const candidateId = req.user!.sub;
      await this.candidateService.unbookmarkJob(candidateId, jobId);
      res.status(200).json({
        status: 'success',
        message: 'Job bookmark removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getBookmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.sub;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { jobs, total } = await this.candidateService.getBookmarks(candidateId, page, limit);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: 'success',
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.sub;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as string;

      const { applications, total } = await this.candidateService.getApplications(
        candidateId,
        page,
        limit,
        status
      );

      const totalPages = Math.ceil(total / limit);

      const formattedApplications = applications.map((app) => {
        const job = app.jobId as any;
        return {
          jobDetails: job
            ? {
              _id: job._id,
              title: job.title,
              description: job.description,
              skills: job.skills,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              jobType: job.jobType,
              location: job.location,
              applicationDeadline: job.applicationDeadline,
            }
            : null,
          recruiterInfo: job ? job.recruiterId : null,
          status: app.status,
          appliedAt: app.appliedAt,
        };
      });

      res.status(200).json({
        status: 'success',
        data: formattedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.sub;
      const dashboard = await this.candidateService.getDashboard(candidateId);
      res.status(200).json({
        status: 'success',
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.sub;
      const user = await this.candidateService.updateProfile(candidateId, req.body);
      res.status(200).json({
        status: 'success',
        data: { user },
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
      const candidateId = req.user!.sub;
      const secureUrl = await this.candidateService.uploadResume(candidateId, req.file.buffer);
      res.status(200).json({
        status: 'success',
        data: {
          resumeUrl: secureUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CandidateController;
