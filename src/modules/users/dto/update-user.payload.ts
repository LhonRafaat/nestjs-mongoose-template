import { z } from 'zod';
import { registerSchema } from '../../auth/dto/register.payload';

// password is left out on purpose: UsersService.update does not hash it
export const updateUserSchema = registerSchema
  .omit({ password: true })
  .partial();

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
