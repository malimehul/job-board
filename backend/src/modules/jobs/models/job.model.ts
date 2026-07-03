import mongoose, { Schema, InferSchemaType } from 'mongoose';

const JobSchema = new Schema(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'Skills are required'],
    },
    salaryMin: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Minimum salary must be non-negative'],
    },
    salaryMax: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Maximum salary must be non-negative'],
    },
    experienceMin: {
      type: Number,
      required: [true, 'Minimum experience is required'],
      min: [0, 'Minimum experience must be non-negative'],
    },
    experienceMax: {
      type: Number,
      required: [true, 'Maximum experience is required'],
      min: [0, 'Maximum experience must be non-negative'],
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed'] as const,
      default: 'open',
      required: [true, 'Job status is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for recruiterId, status, skills and location
JobSchema.index({ recruiterId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ skills: 1 });
JobSchema.index({ location: 1 });

export type IJob = InferSchemaType<typeof JobSchema>;

export interface IJobDocument extends mongoose.Document, IJob {}

export const Job = mongoose.model<IJobDocument>('Job', JobSchema);
export default Job;
