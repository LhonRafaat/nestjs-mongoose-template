import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DB_URL: z.string().min(1),
  ACCESS_SECRET: z.string().min(1),
  REFRESH_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRATION: z.string().min(1),
  REFRESH_TOKEN_EXPIRATION: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
