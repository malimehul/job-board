import User from '../../auth/models/user.model.js';
import Job from '../../jobs/models/job.model.js';
import Application from '../../applications/models/application.model.js';

export class AdminRepository {
  async getDashboardStats(matchQuery: any, startOfToday: Date): Promise<{
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
    const [
      totalUsers,
      totalRecruiters,
      totalCandidates,
      activeUsers,
      suspendedUsers,
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      applicationsToday,
    ] = await Promise.all([
      User.countDocuments(matchQuery),
      User.countDocuments({ ...matchQuery, role: 'Recruiter' }),
      User.countDocuments({ ...matchQuery, role: 'Candidate' }),
      User.countDocuments({ ...matchQuery, status: 'active' }),
      User.countDocuments({ ...matchQuery, status: 'suspended' }),
      Job.countDocuments(matchQuery),
      Job.countDocuments({ ...matchQuery, status: 'open' }),
      Job.countDocuments({ ...matchQuery, status: 'closed' }),
      Application.countDocuments(matchQuery),
      Application.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    return {
      totalUsers,
      totalRecruiters,
      totalCandidates,
      activeUsers,
      suspendedUsers,
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      applicationsToday,
    };
  }

  async getJobsAnalytics(matchQuery: any): Promise<Array<{ date: string; jobs: number }>> {
    return Job.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          jobs: '$count',
        },
      },
    ]);
  }

  async getApplicationsAnalytics(matchQuery: any): Promise<Array<{ date: string; applications: number }>> {
    return Application.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          applications: '$count',
        },
      },
    ]);
  }

  async getTopRecruiters(): Promise<
    Array<{ recruiterId: string; recruiterName: string; jobsPosted: number; applicationsReceived: number }>
  > {
    return Job.aggregate([
      {
        $group: {
          _id: '$recruiterId',
          jobsPosted: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'recruiter',
        },
      },
      { $unwind: '$recruiter' },
      {
        $lookup: {
          from: 'applications',
          let: { recruiterId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'jobs',
                localField: 'jobId',
                foreignField: '_id',
                as: 'job',
              },
            },
            { $unwind: '$job' },
            {
              $match: {
                $expr: { $eq: ['$$recruiterId', '$job.recruiterId'] },
              },
            },
          ],
          as: 'apps',
        },
      },
      {
        $project: {
          _id: 0,
          recruiterId: '$_id',
          recruiterName: '$recruiter.name',
          jobsPosted: 1,
          applicationsReceived: { $size: '$apps' },
        },
      },
      { $sort: { jobsPosted: -1 } },
      { $limit: 10 },
    ]);
  }
}

export default AdminRepository;
