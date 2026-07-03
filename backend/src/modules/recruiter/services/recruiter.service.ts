import RecruiterRepository from '../repositories/recruiter.repository';
import { IUserDocument } from '../../auth/models/user.model';
import { UpdateRecruiterProfileDTO } from '../dtos/recruiter.dto';
import { NotFoundError } from '../../../core/errors/AppError';

export class RecruiterService {
  private recruiterRepository: RecruiterRepository;

  constructor() {
    this.recruiterRepository = new RecruiterRepository();
  }

  async getDashboard(recruiterId: string): Promise<{
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    totalApplications: number;
    totalCandidates: number;
    recentApplications: any[];
    recentJobs: any[];
    applicationsPerJob: any[];
    upcomingDeadlines: any[];
  }> {
    const stats = await this.recruiterRepository.getDashboardStats(recruiterId);
    return stats;
  }

  async updateProfile(recruiterId: string, updateData: UpdateRecruiterProfileDTO): Promise<IUserDocument> {
    const user = await this.recruiterRepository.findById(recruiterId);
    if (!user || user.role !== 'Recruiter') {
      throw new NotFoundError('Recruiter not found');
    }
    const updatedUser = await this.recruiterRepository.updateProfile(recruiterId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('Recruiter not found');
    }
    return updatedUser;
  }
}

export default RecruiterService;
