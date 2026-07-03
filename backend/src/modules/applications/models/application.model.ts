import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ApplicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'] as const,
      default: 'Applied',
      required: [true, 'Application status is required'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: [true, 'Applied date is required'],
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

// Add indexes for jobId, candidateId and status
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ status: 1 });

export type IApplication = InferSchemaType<typeof ApplicationSchema>;

export interface IApplicationDocument extends mongoose.Document, IApplication {}

export const Application = mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
export default Application;
