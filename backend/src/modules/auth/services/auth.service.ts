import bcrypt from 'bcrypt';
import crypto from 'crypto';
import UserRepository from '../repositories/user.repository';
import { IUserDocument } from '../models/user.model';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../../core/errors/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../core/utils/jwt';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, ForgotPasswordDTO, ResetPasswordDTO } from '../dtos/auth.dto';
import { sendPasswordResetEmail } from '../../../core/utils/email';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: RegisterDTO): Promise<IUserDocument> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await this.userRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: userData.role,
      profile: userData.profile,
    });

    return user;
  }

  async login(credentials: LoginDTO): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(credentials.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      role: user.role,
    });

    // Save refresh token to DB to enable revocation
    await this.userRepository.update(user._id.toString(), { refreshToken });

    return { user, accessToken, refreshToken };
  }

  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDTO
  ): Promise<IUserDocument> {
    const user = await this.userRepository.update(userId, updateData);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      const user = await this.userRepository.findById(payload.sub);

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const accessToken = signAccessToken({
        sub: user._id.toString(),
        role: user.role,
      });

      const refreshToken = signRefreshToken({
        sub: user._id.toString(),
        role: user.role,
      });

      // Update stored refresh token (Rotation)
      await this.userRepository.update(user._id.toString(), { refreshToken });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new NotFoundError('No account found with this email address');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await this.userRepository.update(user._id.toString(), {
      passwordResetToken: hashedToken,
      passwordResetExpires: resetExpires,
    });

    await sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(data.token).digest('hex');

    const user = await this.userRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await this.userRepository.update(user._id.toString(), {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null, // Revoke refresh tokens to force re-authentication
    });
  }
}

export default AuthService;
