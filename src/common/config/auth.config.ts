import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const authConfigSchema = z.object({
  google: z.object({
    clientId: z.string().nonempty(),
    clientSecret: z.string().nonempty(),
  }),
  jwtSecret: z.string().nonempty(),
  frontendUrl: z.string().default('http://localhost:5173'),
  accessTokenExpiresIn: z.string().default('3h'),
  passwordResetExpiresInMinutes: z.number().default(15),
  bcryptSaltRounds: z.number().default(10),
  rateLimitMaxAttempts: z.number().default(5),
  rateLimitWindowMinutes: z.number().default(15),
});

export const authConfigObj = registerAs('auth', () => {
  return authConfigSchema.parse({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '3h',
    passwordResetExpiresInMinutes:
      Number(process.env.PASSWORD_RESET_EXPIRES_IN_MINUTES) || 15,
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    rateLimitMaxAttempts: Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 5,
    rateLimitWindowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
  });
});

export type AuthConfig = ConfigType<typeof authConfigObj>;
