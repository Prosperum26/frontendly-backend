import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const authConfigSchema = z.object({
  google: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }),
  jwtSecret: z.string().default('default-super-secret-jwt-key-for-development-only-change-in-production'),
});

export const authConfigObj = registerAs('auth', () => {
  return authConfigSchema.parse({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || undefined,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || undefined,
    },
    jwtSecret: process.env.JWT_SECRET || undefined,
  });
});

export type AuthConfig = ConfigType<typeof authConfigObj>;
