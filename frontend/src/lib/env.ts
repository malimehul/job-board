import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:5000/api"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const result = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!result.success) {
  console.error("❌ Invalid environment variables:", result.error.format());
  throw new Error("Invalid environment variables");
}

export const env = result.data;
export default env;
