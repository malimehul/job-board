import RecruiterRepository from '../repositories/recruiter.repository.js';
import { IUserDocument } from '../../auth/models/user.model.js';
import { UpdateRecruiterProfileDTO } from '../dtos/recruiter.dto.js';
import { NotFoundError } from '../../../core/errors/AppError.js';

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
