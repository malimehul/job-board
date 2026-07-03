import { User, IUserDocument } from '../models/user.model';
import { CreateUserRepoDTO, UpdateProfileDTO } from '../dtos/auth.dto';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByRefreshToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({ refreshToken: token });
  }

  async create(userData: CreateUserRepoDTO): Promise<IUserDocument> {
    const user = new User(userData);
    return user.save();
  }

  async findByResetToken(token: string): Promise<IUserDocument | null> {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
  }

  async update(
    id: string,
    updateData: UpdateProfileDTO & {
      status?: 'active' | 'suspended';
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null;
      passwordHash?: string;
    }
  ): Promise<IUserDocument | null> {
    const updateQuery: any = {};

    if (updateData.name !== undefined) updateQuery.name = updateData.name;
    if (updateData.refreshToken !== undefined) updateQuery.refreshToken = updateData.refreshToken;
    if (updateData.status !== undefined) updateQuery.status = updateData.status;
    if (updateData.passwordResetToken !== undefined) updateQuery.passwordResetToken = updateData.passwordResetToken;
    if (updateData.passwordResetExpires !== undefined) updateQuery.passwordResetExpires = updateData.passwordResetExpires;
    if (updateData.passwordHash !== undefined) updateQuery.passwordHash = updateData.passwordHash;

    // Flatten profile object to prevent overwriting other nested profile properties in Mongo
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

  async findUsers(filters: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: IUserDocument[]; total: number }> {
    const { page = 1, limit = 10, role, status, search } = filters;
    const query: any = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total };
  }
}

export default UserRepository;
