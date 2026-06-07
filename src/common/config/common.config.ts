import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const commonConfigSchema = z.object({
  nodeEnv: z.enum(['local', 'development', 'production']),
  port: z.coerce.number().positive(),
  dbUri: z.string().nonempty(),
});

export const commonConfigObj = registerAs('common', () => {
  return commonConfigSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    dbUri: process.env.DB_URI,
  });
});

export type CommonConfig = ConfigType<typeof commonConfigObj>;
