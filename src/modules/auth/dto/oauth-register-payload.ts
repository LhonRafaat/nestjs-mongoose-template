import { z } from 'zod';
import { registerSchema } from './register.payload';

export const oauthRegisterSchema = registerSchema
  .omit({ password: true, isAdmin: true })
  .extend({
    oauthProvider: z.string().min(1),
    oauthProviderId: z.string().min(1),
  });

export type OAuthRegisterPayload = z.infer<typeof oauthRegisterSchema>;
