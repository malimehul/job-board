import bcrypt from 'bcrypt';
import env from '../../../core/config/environment';
import logger from '../../../core/utils/logger';
import User from '../../auth/models/user.model';

const BCRYPT_SALT_ROUNDS = 10;

export const initializeAdminUser = async (): Promise<void> => {
  const userCount = await User.countDocuments();

  if (userCount > 0) {
    logger.debug('User collection is not empty; default admin initialization skipped');
    return;
  }

  if (!env.ADMIN_NAME || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error(
      'ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured in .env when the user collection is empty'
    );
  }

  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

  // The email has a unique index, and upsert makes concurrent/repeated startup
  // attempts resolve to the same admin account without overwriting it.
  await User.updateOne(
    { email },
    {
      $setOnInsert: {
        name: env.ADMIN_NAME,
        email,
        passwordHash,
        role: 'Admin',
        status: 'active',
      },
    },
    { upsert: true, runValidators: true }
  );

  logger.info(`Default admin user initialized: ${email}`);
};

export default initializeAdminUser;
