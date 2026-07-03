import JobRepository from '../repositories/job.repository.js';
import { IJobDocument } from '../models/job.model.js';
import { CreateJobDTO, UpdateJobDTO } from '../dtos/job.dto.js';
import { JobSearchQueryDTO } from '../dtos/job.query.dto.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../core/errors/AppError.js';

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async createJob(recruiterId: string, jobData: CreateJobDTO): Promise<IJobDocument> {
    return this.jobRepository.create(recruiterId, jobData);
  }

  async getJobById(id: string): Promise<IJobDocument> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    return job;
  }

  async getJobsByRecruiter(recruiterId: string): Promise<IJobDocument[]> {
    return this.jobRepository.findByRecruiterId(recruiterId);
  }

  async searchJobs(filters: JobSearchQueryDTO): Promise<{ jobs: IJobDocument[]; total: number }> {
    return this.jobRepository.findWithFilters(filters);
  }

  async updateJob(id: string, recruiterId: string, updateData: UpdateJobDTO): Promise<IJobDocument> {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    const jobRecruiterId = (existingJob.recruiterId as any)._id?.toString() || existingJob.recruiterId.toString();
    if (jobRecruiterId !== recruiterId) {
      throw new ForbiddenError('You do not have permission to modify this job');
    }

    // Business check: validate cross-field salary min/max constraint for updates
    const finalSalaryMin = updateData.salaryMin !== undefined ? updateData.salaryMin : existingJob.salaryMin;
    const finalSalaryMax = updateData.salaryMax !== undefined ? updateData.salaryMax : existingJob.salaryMax;

    if (finalSalaryMax < finalSalaryMin) {
      throw new BadRequestError('Maximum salary must be greater than or equal to minimum salary');
    }

    const updatedJob = await this.jobRepository.update(id, updateData);
    if (!updatedJob) {
      throw new NotFoundError('Job not found');
    }
    return updatedJob;
  }

  async deleteJob(id: string, recruiterId: string): Promise<void> {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    const jobRecruiterId = (existingJob.recruiterId as any)._id?.toString() || existingJob.recruiterId.toString();
    if (jobRecruiterId !== recruiterId) {
      throw new ForbiddenError('You do not have permission to delete this job');
    }

    await this.jobRepository.delete(id);
  }

  async updateJobStatus(id: string, recruiterId: string, status: 'open' | 'closed'): Promise<IJobDocument> {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }

    const jobRecruiterId = (existingJob.recruiterId as any)._id?.toString() || existingJob.recruiterId.toString();
    if (jobRecruiterId !== recruiterId) {
      throw new ForbiddenError('You do not have permission to modify this job');
    }

    const updatedJob = await this.jobRepository.update(id, { status });
    if (!updatedJob) {
      throw new NotFoundError('Job not found');
    }
    return updatedJob;
  }
}

export default JobService;
