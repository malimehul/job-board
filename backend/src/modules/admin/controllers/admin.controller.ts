import { Request, Response, NextFunction } from 'express';
import AdminService from '../services/admin.service.js';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboard(req.query);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { users, total } = await this.adminService.getUsers(req.query);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: 'success',
        data: users,
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

  suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const user = await this.adminService.suspendUser(id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const user = await this.adminService.activateUser(id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { jobs, total } = await this.adminService.getJobs(req.query);
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
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { applications, total } = await this.adminService.getApplications(req.query);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: 'success',
        data: applications,
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

  getJobsAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.getJobsAnalytics(req.query);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationsAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.getApplicationsAnalytics(req.query);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getTopRecruiters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.getTopRecruiters();
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
