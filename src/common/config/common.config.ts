import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const commonConfigSchema = z.object({
  nodeEnv: z.enum(['local', 'development', 'production']),
  port: z.number().positive(),
  dbUri: z.string().min(1),
  corsOrigins: z.array(z.string()).min(1),
});

type NodeEnv = 'local' | 'development' | 'production';

type CommonConfigType = z.infer<typeof commonConfigSchema>;

export const commonConfigObj = registerAs('common', () => {
  const config: CommonConfigType = {
    nodeEnv: <NodeEnv>(process.env.NODE_ENV || 'local'),
    port: parseInt(process.env.PORT || '3000', 10),
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/frontendly',
    corsOrigins: (
      process.env.CORS_ORIGINS ||
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      'http://localhost:5173,http://localhost:3000'
    ).split(','),
  };
  commonConfigSchema.parse(config);
  return config;
});

export type CommonConfig = ConfigType<typeof commonConfigObj>;
