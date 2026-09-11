import { z } from 'zod';

// strictObject rejects unknown keys (same as the old whitelist + forbidNonWhitelisted)
export const loginSchema = z.strictObject({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type LoginPayload = z.infer<typeof loginSchema>;
