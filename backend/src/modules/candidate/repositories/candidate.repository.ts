import User, { IUserDocument } from '../../auth/models/user.model';
import Application, { IApplicationDocument } from '../../applications/models/application.model';
import Job, { IJobDocument } from '../../jobs/models/job.model';

export class CandidateRepository {
  async getCandidateById(
    candidateId: string
  ): Promise<IUserDocument | null> {
    return User.findOne({
      _id: candidateId,
      role: 'Candidate',
    });
  }

  async addBookmark(candidateId: string, jobId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      candidateId,
      { $addToSet: { savedJobs: jobId } },
      { new: true }
    );
  }

  async removeBookmark(candidateId: string, jobId: string): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      candidateId,
      { $pull: { savedJobs: jobId } },
      { new: true }
    );
  }

  async getBookmarks(candidateId: string, skip: number, limit: number): Promise<IJobDocument[]> {
    const user = await User.findById(candidateId, 'savedJobs');
    if (!user || !user.savedJobs || user.savedJobs.length === 0) {
      return [];
    }

    return Job.find({ _id: { $in: user.savedJobs } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recruiterId', 'name email profile');
  }

  async countBookmarks(candidateId: string): Promise<number> {
    const user = await User.findById(candidateId, 'savedJobs');
    return user && user.savedJobs ? user.savedJobs.length : 0;
  }

  async getApplications(
    candidateId: string,
    status?: string,
    skip?: number,
    limit?: number
  ): Promise<IApplicationDocument[]> {
    const query: any = { candidateId };
    if (status) {
      query.status = status;
    }

    let dbQuery = Application.find(query).sort({ createdAt: -1 });

    if (skip !== undefined) {
      dbQuery = dbQuery.skip(skip);
    }
    if (limit !== undefined) {
      dbQuery = dbQuery.limit(limit);
    }

    return dbQuery.populate({
      path: 'jobId',
      populate: {
        path: 'recruiterId',
        select: 'name email profile',
      },
    });
  }

  async countApplications(candidateId: string, status?: string): Promise<number> {
    const query: any = { candidateId };
    if (status) {
      query.status = status;
    }
    return Application.countDocuments(query);
  }

  async getDashboardStats(candidateId: string): Promise<{
    user: IUserDocument | null;
    totalApplications: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    savedJobsCount: number;
    recentApplications: IApplicationDocument[];
  }> {
    const [
      user,
      totalApplications,
      shortlisted,
      interviewed,
      hired,
      recentApplications,
    ] = await Promise.all([
      User.findById(candidateId),
      Application.countDocuments({ candidateId }),
      Application.countDocuments({ candidateId, status: 'Shortlisted' }),
      Application.countDocuments({ candidateId, status: 'Interviewed' }),
      Application.countDocuments({ candidateId, status: 'Hired' }),
      Application.find({ candidateId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'jobId',
          populate: {
            path: 'recruiterId',
            select: 'name email profile',
          },
        }),
    ]);

    const savedJobsCount = user && user.savedJobs ? user.savedJobs.length : 0;

    return {
      user,
      totalApplications,
      shortlisted,
      interviewed,
      hired,
      savedJobsCount,
      recentApplications,
    };
  }
}

export default CandidateRepository;
