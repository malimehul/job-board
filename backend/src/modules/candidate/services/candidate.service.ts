import CandidateRepository from '../repositories/candidate.repository';
import JobRepository from '../../jobs/repositories/job.repository';
import UserRepository from '../../auth/repositories/user.repository';
import { IJobDocument } from '../../jobs/models/job.model';
import { IApplicationDocument } from '../../applications/models/application.model';
import { IUserDocument } from '../../auth/models/user.model';
import { NotFoundError } from '../../../core/errors/AppError';
import { uploadBufferToCloudinary } from '../../../core/utils/cloudinary';

export class CandidateService {
  private candidateRepository: CandidateRepository;
  private jobRepository: JobRepository;
  private userRepository: UserRepository;

  constructor() {
    this.candidateRepository = new CandidateRepository();
    this.jobRepository = new JobRepository();
    this.userRepository = new UserRepository();
  }

  async bookmarkJob(candidateId: string, jobId: string): Promise<void> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    await this.candidateRepository.addBookmark(candidateId, jobId);
  }

  async unbookmarkJob(candidateId: string, jobId: string): Promise<void> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    await this.candidateRepository.removeBookmark(candidateId, jobId);
  }

  async getBookmarks(
    candidateId: string,
    page: number,
    limit: number
  ): Promise<{ jobs: IJobDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      this.candidateRepository.getBookmarks(candidateId, skip, limit),
      this.candidateRepository.countBookmarks(candidateId),
    ]);
    return { jobs, total };
  }

  async getApplications(
    candidateId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{ applications: IApplicationDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      this.candidateRepository.getApplications(candidateId, status, skip, limit),
      this.candidateRepository.countApplications(candidateId, status),
    ]);
    return { applications, total };
  }

  async updateProfile(candidateId: string, updateData: any): Promise<IUserDocument> {
    const user = await this.userRepository.findById(candidateId);
    if (!user || user.role !== 'Candidate') {
      throw new NotFoundError('Candidate profile not found');
    }
    const updatedUser = await this.userRepository.update(candidateId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('Candidate profile not found');
    }
    return updatedUser;
  }

  async uploadResume(candidateId: string, buffer: Buffer): Promise<string> {
    const user = await this.userRepository.findById(candidateId);
    if (!user || user.role !== 'Candidate') {
      throw new NotFoundError('Candidate profile not found');
    }
    const secureUrl = await uploadBufferToCloudinary(buffer);
    await this.userRepository.update(candidateId, {
      profile: {
        resumeUrl: secureUrl,
      },
    });
    return secureUrl;
  }

  async getDashboard(candidateId: string): Promise<{
    profileCompletion: number;
    totalApplications: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    savedJobs: number;
    recentApplications: IApplicationDocument[];
  }> {
    const stats = await this.candidateRepository.getDashboardStats(candidateId);
    if (!stats.user) {
      throw new NotFoundError('Candidate profile not found');
    }

    const { user } = stats;

    // Profile completion math: 20% per field
    // Fields: name, email, skills, experience, resumeUrl
    let completionScore = 0;
    if (user.name && user.name.trim() !== '') completionScore += 20;
    if (user.email && user.email.trim() !== '') completionScore += 20;
    if (user.profile) {
      if (user.profile.skills && user.profile.skills.length > 0) completionScore += 20;
      if (user.profile.experience !== undefined && user.profile.experience !== null) completionScore += 20;
      if (user.profile.resumeUrl && user.profile.resumeUrl.trim() !== '') completionScore += 20;
    }

    return {
      profileCompletion: completionScore,
      totalApplications: stats.totalApplications,
      shortlisted: stats.shortlisted,
      interviewed: stats.interviewed,
      hired: stats.hired,
      savedJobs: stats.savedJobsCount,
      recentApplications: stats.recentApplications,
    };
  }
}

export default CandidateService;
