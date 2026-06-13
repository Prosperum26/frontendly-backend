import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const authConfigSchema = z.object({
  google: z.object({
    clientId: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
  }),
  jwtSecret: z.string().nonempty(),
});

export const authConfigObj = registerAs('auth', () => {
  return authConfigSchema.parse({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    jwtSecret: process.env.JWT_SECRET,
  });
});

export type AuthConfig = ConfigType<typeof authConfigObj>;
