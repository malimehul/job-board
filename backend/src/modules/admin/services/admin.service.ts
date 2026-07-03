import AdminRepository from '../repositories/admin.repository';
import UserRepository from '../../auth/repositories/user.repository';
import JobRepository from '../../jobs/repositories/job.repository';
import ApplicationRepository from '../../applications/repositories/application.repository';
import { IUserDocument } from '../../auth/models/user.model';
import { IJobDocument } from '../../jobs/models/job.model';
import { IApplicationDocument } from '../../applications/models/application.model';
import { UserQueryDTO, JobQueryDTO, ApplicationQueryDTO, AnalyticsQueryDTO } from '../dtos/admin.dto';
import { NotFoundError, BadRequestError } from '../../../core/errors/AppError';

export class AdminService {
  private adminRepository: AdminRepository;
  private userRepository: UserRepository;
  private jobRepository: JobRepository;
  private applicationRepository: ApplicationRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.userRepository = new UserRepository();
    this.jobRepository = new JobRepository();
    this.applicationRepository = new ApplicationRepository();
  }

  async getDashboard(query: AnalyticsQueryDTO): Promise<{
    totalUsers: number;
    totalRecruiters: number;
    totalCandidates: number;
    activeUsers: number;
    suspendedUsers: number;
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    totalApplications: number;
    applicationsToday: number;
  }> {
    const matchQuery = this.buildAnalyticsMatchQuery(query);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return this.adminRepository.getDashboardStats(matchQuery, startOfToday);
  }

  async getUsers(filters: UserQueryDTO): Promise<{ users: IUserDocument[]; total: number }> {
    return this.userRepository.findUsers(filters);
  }

  async suspendUser(userId: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Rule: Cannot suspend another Admin
    if (user.role === 'Admin') {
      throw new BadRequestError('Cannot suspend another Admin user account');
    }

    const updatedUser = await this.userRepository.update(userId, { status: 'suspended' });
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    return updatedUser;
  }

  async activateUser(userId: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { status: 'active' });
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    return updatedUser;
  }

  async getJobs(filters: JobQueryDTO): Promise<{ jobs: IJobDocument[]; total: number }> {
    return this.jobRepository.findWithFilters(filters);
  }

  async getApplications(
    filters: ApplicationQueryDTO
  ): Promise<{ applications: IApplicationDocument[]; total: number }> {
    return this.applicationRepository.findWithFilters(filters);
  }

  private buildAnalyticsMatchQuery(query: AnalyticsQueryDTO): any {
    const matchQuery: any = {};
    const { period, startDate, endDate } = query;

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    } else if (period) {
      const now = new Date();
      matchQuery.createdAt = {};
      if (period === 'today') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        matchQuery.createdAt.$gte = start;
      } else if (period === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        matchQuery.createdAt.$gte = start;
      } else if (period === 'month') {
        const start = new Date(now);
        start.setDate(now.getDate() - 30);
        matchQuery.createdAt.$gte = start;
      }
    }

    return matchQuery;
  }

  async getJobsAnalytics(query: AnalyticsQueryDTO): Promise<Array<{ date: string; jobs: number }>> {
    const matchQuery = this.buildAnalyticsMatchQuery(query);
    return this.adminRepository.getJobsAnalytics(matchQuery);
  }

  async getApplicationsAnalytics(
    query: AnalyticsQueryDTO
  ): Promise<Array<{ date: string; applications: number }>> {
    const matchQuery = this.buildAnalyticsMatchQuery(query);
    return this.adminRepository.getApplicationsAnalytics(matchQuery);
  }

  async getTopRecruiters(): Promise<
    Array<{ recruiterId: string; recruiterName: string; jobsPosted: number; applicationsReceived: number }>
  > {
    return this.adminRepository.getTopRecruiters();
  }
}

export default AdminService;
