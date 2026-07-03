import Application, { IApplicationDocument } from '../models/application.model.js';
import { CreateApplicationDTO } from '../dtos/application.dto.js';

export class ApplicationRepository {
  async create(candidateId: string, data: CreateApplicationDTO): Promise<IApplicationDocument> {
    const application = new Application({
      ...data,
      candidateId,
    });
    return application.save();
  }

  async findById(id: string): Promise<IApplicationDocument | null> {
    return Application.findById(id);
  }

  async findByCandidateId(candidateId: string): Promise<IApplicationDocument[]> {
    return Application.find({ candidateId })
      .populate({
        path: 'jobId',
        populate: {
          path: 'recruiterId',
          select: 'name email profile',
        },
      })
      .sort({ createdAt: -1 });
  }

  async findByJobId(jobId: string): Promise<IApplicationDocument[]> {
    return Application.find({ jobId })
      .populate('candidateId', 'name email profile')
      .sort({ createdAt: -1 });
  }

  async findOne(filter: any): Promise<IApplicationDocument | null> {
    return Application.findOne(filter);
  }

  async updateStatus(id: string, status: string): Promise<IApplicationDocument | null> {
    return Application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate('candidateId', 'name email profile').populate('jobId');
  }

  async findAll(): Promise<IApplicationDocument[]> {
    return Application.find()
      .populate({
        path: 'jobId',
        populate: {
          path: 'recruiterId',
          select: 'name email profile',
        },
      })
      .populate('candidateId', 'name email profile')
      .sort({ createdAt: -1 });
  }

  async findWithFilters(filters: {
    page?: number;
    limit?: number;
    status?: string;
    jobId?: string;
    candidateId?: string;
  }): Promise<{ applications: IApplicationDocument[]; total: number }> {
    const { page = 1, limit = 10, status, jobId, candidateId } = filters;
    const query: any = {};

    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (candidateId) query.candidateId = candidateId;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'jobId',
          populate: {
            path: 'recruiterId',
            select: 'name email profile',
          },
        })
        .populate('candidateId', 'name email profile'),
      Application.countDocuments(query),
    ]);

    return { applications, total };
  }
}

export default ApplicationRepository;
