import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().startsWith('postgresql://', {
    message: "DATABASE_URL must start with 'postgresql://'",
  }),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, {
    message: 'JWT_SECRET must be at least 32 characters long',
  }),
  JWT_REFRESH_SECRET: z.string().min(32, {
    message: 'JWT_REFRESH_SECRET must be at least 32 characters long',
  }),
  GAPGPT_API_KEY: z.string().min(1, {
    message: 'GAPGPT_API_KEY must not be empty',
  }),
  FRONTEND_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
