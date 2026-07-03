import ApplicationRepository from '../repositories/application.repository.js';
import JobRepository from '../../jobs/repositories/job.repository.js';
import { IApplicationDocument } from '../models/application.model.js';
import { CreateApplicationDTO } from '../dtos/application.dto.js';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../../../core/errors/AppError.js';
import { sendApplicationStatusEmail } from '../../../core/utils/email.js';
import CandidateRepository from '../../candidate/repositories/candidate.repository.js';

export class ApplicationService {
  private candidateRepository: CandidateRepository;
  private applicationRepository: ApplicationRepository;
  private jobRepository: JobRepository;

  constructor() {
    this.candidateRepository = new CandidateRepository();
    this.applicationRepository = new ApplicationRepository();
    this.jobRepository = new JobRepository();
  }

  async applyForJob(candidateId: string, data: CreateApplicationDTO): Promise<IApplicationDocument> {
    const job = await this.jobRepository.findById(data.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Candidate can apply only to OPEN jobs
    if (job.status !== 'open') {
      throw new BadRequestError('This job listing is closed and no longer accepting applications');
    }

    // Candidate cannot apply after applicationDeadline
    const now = new Date();
    if (now > new Date(job.applicationDeadline)) {
      throw new BadRequestError('The application deadline for this job has passed');
    }

    // Candidate cannot apply to the same job twice
    const existingApplication = await this.applicationRepository.findOne({
      jobId: data.jobId,
      candidateId,
    });
    if (existingApplication) {
      throw new ConflictError('You have already applied for this job');
    }

    return this.applicationRepository.create(candidateId, data);
  }

  async getCandidateApplications(candidateId: string): Promise<IApplicationDocument[]> {
    return this.applicationRepository.findByCandidateId(candidateId);
  }

  async getJobApplications(jobId: string, recruiterId: string): Promise<IApplicationDocument[]> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Recruiters can view applications only for their own jobs
    const jobRecruiterId = (job.recruiterId as any)._id?.toString() || job.recruiterId.toString();
    if (jobRecruiterId !== recruiterId) {
      throw new ForbiddenError('You do not have permission to view applications for this job');
    }

    return this.applicationRepository.findByJobId(jobId);
  }

  async updateStatus(
    applicationId: string,
    recruiterId: string,
    status: 'Applied' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired'
  ): Promise<IApplicationDocument> {
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const job = await this.jobRepository.findById(application.jobId.toString());
    if (!job) {
      throw new NotFoundError('Associated job not found');
    }

    // Recruiters can update application status only for their own jobs
    const jobRecruiterId = (job.recruiterId as any)._id?.toString() || job.recruiterId.toString();
    if (jobRecruiterId !== recruiterId) {
      throw new ForbiddenError('You do not have permission to update this application status');
    }

    const updatedApplication = await this.applicationRepository.updateStatus(applicationId, status);
    if (!updatedApplication) {
      throw new NotFoundError('Application not found');
    }

    const candidate = await this.candidateRepository.getCandidateById(
      updatedApplication.candidateId._id.toString()
    );

    if (candidate) {
      sendApplicationStatusEmail(
        candidate.email,
        candidate.name,
        job.title,
        status
      );
    }

    return updatedApplication;
  }

  async getAllApplications(): Promise<IApplicationDocument[]> {
    return this.applicationRepository.findAll();
  }
}

export default ApplicationService;
