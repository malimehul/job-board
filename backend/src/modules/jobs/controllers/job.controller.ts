import { Request, Response, NextFunction } from 'express';
import JobService from '../services/job.service';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recruiterId = req.user!.sub;
      const job = await this.jobService.createJob(recruiterId, req.body);
      res.status(201).json({
        status: 'success',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  getMyJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recruiterId = req.user!.sub;
      const { jobs, total } = await this.jobService.searchJobs({
        ...req.query,
        recruiterId,
      });
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: 'success',
        data: { jobs },
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

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobs, total } = await this.jobService.searchJobs(req.query);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
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

  getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const job = await this.jobService.getJobById(id);
      res.status(200).json({
        status: 'success',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  updateJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const recruiterId = req.user!.sub;
      const job = await this.jobService.updateJob(id, recruiterId, req.body);
      res.status(200).json({
        status: 'success',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const recruiterId = req.user!.sub;
      await this.jobService.deleteJob(id, recruiterId);
      res.status(200).json({
        status: 'success',
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  closeJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const recruiterId = req.user!.sub;
      const job = await this.jobService.updateJobStatus(id, recruiterId, 'closed');
      res.status(200).json({
        status: 'success',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  reopenJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const recruiterId = req.user!.sub;
      const job = await this.jobService.updateJobStatus(id, recruiterId, 'open');
      res.status(200).json({
        status: 'success',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default JobController;
