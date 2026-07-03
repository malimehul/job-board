import Job, { IJobDocument } from '../models/job.model.js';
import Application from '../../applications/models/application.model.js';
import { CreateJobDTO, UpdateJobDTO } from '../dtos/job.dto.js';
import { JobSearchQueryDTO } from '../dtos/job.query.dto.js';

export class JobRepository {
  async create(recruiterId: string, jobData: CreateJobDTO): Promise<IJobDocument> {
    const job = new Job({
      ...jobData,
      recruiterId,
    });
    return job.save();
  }

  async findById(id: string): Promise<IJobDocument | null> {
    return Job.findById(id).populate('recruiterId', 'name email profile');
  }

  async findByRecruiterId(recruiterId: string): Promise<IJobDocument[]> {
    return Job.find({ recruiterId }).populate('recruiterId', 'name email profile');
  }

  async findWithFilters(filters: JobSearchQueryDTO): Promise<{ jobs: IJobDocument[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      keyword,
      skills,
      location,
      jobType,
      salaryMin,
      salaryMax,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.recruiterId) {
      query.recruiterId = filters.recruiterId;
    }

    // Keyword text search (case-insensitive) on title, description, skills
    if (keyword) {
      const keywordRegex = { $regex: keyword, $options: 'i' };
      query.$or = [
        { title: keywordRegex },
        { description: keywordRegex },
        { skills: keywordRegex },
      ];
    }

    // Skills filter (comma-separated string, matches elements matching regex)
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        query.skills = {
          $in: skillsArray.map((skill) => new RegExp(`^${skill}$`, 'i')),
        };
      }
    }

    // Location (case-insensitive regex)
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // JobType (case-insensitive regex)
    if (jobType) {
      query.jobType = { $regex: jobType, $options: 'i' };
    }

    // Salary filters
    if (salaryMin !== undefined) {
      query.salaryMin = { $gte: salaryMin };
    }

    if (salaryMax !== undefined) {
      query.salaryMax = { $lte: salaryMax };
    }

    if (filters.hasApplications === 'true') {
      const jobIdsWithApplications = await Application.distinct('jobId');
      query._id = { $in: jobIdsWithApplications };
    }

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortObj: any = { [sortBy]: sortDir };

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('recruiterId', 'name email profile'),
      Job.countDocuments(query),
    ]);

    return { jobs, total };
  }

  async update(id: string, updateData: UpdateJobDTO): Promise<IJobDocument | null> {
    return Job.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IJobDocument | null> {
    return Job.findByIdAndDelete(id);
  }
}

export default JobRepository;
