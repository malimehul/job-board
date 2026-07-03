import mongoose, { Schema, InferSchemaType } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['Candidate', 'Recruiter', 'Admin'] as const,
      required: [true, 'Role is required'],
    },
    refreshToken: {
      type: String,
      index: true,
    },
    passwordResetToken: {
      type: String,
      index: true,
    },
    passwordResetExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'] as const,
      default: 'active',
      required: true,
    },
    savedJobs: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
      default: [],
    },
    profile: {
      title: { type: String, trim: true },
      bio: { type: String, trim: true },
      resumeUrl: { type: String, trim: true },
      companyName: { type: String, trim: true },
      companyWebsite: { type: String, trim: true },
      skills: { type: [String], default: [] },
      experience: { type: Number },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Infer TypeScript types directly from the Mongoose Schema definition!
export type IUser = InferSchemaType<typeof UserSchema>;

// Extend document for methods
export interface IUserDocument extends mongoose.Document, IUser {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
export default User;
