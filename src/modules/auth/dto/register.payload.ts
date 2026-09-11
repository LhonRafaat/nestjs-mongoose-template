import { z } from 'zod';

export const registerSchema = z.strictObject({
  fullName: z.string().min(1),
  password: z.string().min(1),
  email: z.string().min(1),
  avatar: z.string(),
  // remove isAdmin in production, this is for testing purposes
  isAdmin: z.boolean().optional(),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
