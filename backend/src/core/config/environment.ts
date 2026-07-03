import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default('mongodb://localhost:27017/job-board'),
  JWT_SECRET: z.string().default('super_secret_key_change_me_in_production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_key_change_me_in_production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().default('your_cloudinary_cloud_name_here'),
  CLOUDINARY_API_KEY: z.string().default('your_cloudinary_api_key_here'),
  CLOUDINARY_API_SECRET: z.string().default('your_cloudinary_api_secret_here'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ADMIN_NAME: z.string().trim().min(1).optional(),
  ADMIN_EMAIL: z.email({ error: 'Invalid admin email address' }).optional(),
  ADMIN_PASSWORD: z.string().min(8).max(128).optional(),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Environment validation failed:', envParsed.error.format());
  process.exit(1);
}

export const env = envParsed.data;
export default env;
