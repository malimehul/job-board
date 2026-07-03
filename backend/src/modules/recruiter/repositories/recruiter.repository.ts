import Job from '../../jobs/models/job.model';
import Application from '../../applications/models/application.model';
import User, { IUserDocument } from '../../auth/models/user.model';
import { UpdateRecruiterProfileDTO } from '../dtos/recruiter.dto';

export class RecruiterRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async updateProfile(id: string, updateData: UpdateRecruiterProfileDTO): Promise<IUserDocument | null> {
    const updateQuery: any = {};

    if (updateData.name !== undefined) updateQuery.name = updateData.name;

    if (updateData.profile) {
      for (const [key, value] of Object.entries(updateData.profile)) {
        if (value !== undefined) {
          updateQuery[`profile.${key}`] = value;
        }
      }
    }

    return User.findByIdAndUpdate(
      id,
      { $set: updateQuery },
      { new: true, runValidators: true }
    );
  }

  async getDashboardStats(recruiterId: string): Promise<{
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
    const totalJobs = await Job.countDocuments({ recruiterId });
    const openJobs = await Job.countDocuments({ recruiterId, status: 'open' });
    const closedJobs = await Job.countDocuments({ recruiterId, status: 'closed' });

    // Find jobs owned by recruiter to get applications received
    const recruiterJobs = await Job.find({ recruiterId });
    const jobIds = recruiterJobs.map((job) => job._id);

    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });

    // Count unique candidates
    const totalCandidates = (await Application.distinct('candidateId', { jobId: { $in: jobIds } })).length;

    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('candidateId', 'name email profile')
      .populate('jobId', 'title location salaryMin salaryMax');

    // Recently created jobs
    const recentJobs = await Job.find({ recruiterId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Applications per job statistics
    const appCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    const appCountsMap = new Map(appCounts.map(item => [item._id.toString(), item.count]));

    const applicationsPerJob = recruiterJobs.map(job => ({
      jobId: job._id,
      title: job.title,
      applicationsCount: appCountsMap.get(job._id.toString()) || 0,
      status: job.status
    })).sort((a, b) => b.applicationsCount - a.applicationsCount).slice(0, 5);

    // Upcoming application deadlines (open jobs only, sorted by deadline ascending)
    const upcomingDeadlines = await Job.find({ recruiterId, status: 'open' })
      .sort({ applicationDeadline: 1 })
      .limit(5);

    return {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      totalCandidates,
      recentApplications,
      recentJobs,
      applicationsPerJob,
      upcomingDeadlines
    };
  }
}

export default RecruiterRepository;
