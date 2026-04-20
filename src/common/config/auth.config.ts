import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const authConfigSchema = z.object({
  google: z.object({
    clientId: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
  }),
  jwtSecret: z.string().nonempty(),
});

type AuthConfigType = z.infer<typeof authConfigSchema>;

export const authConfigObj = registerAs('auth', () => {
  const config: AuthConfigType = {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    jwtSecret: process.env.JWT_SECRET,
  };
  authConfigSchema.parse(config);
  return config;
});

export type AuthConfig = ConfigType<typeof authConfigObj>;
