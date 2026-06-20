import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const commonConfigSchema = z.object({
  nodeEnv: z.enum(['local', 'development', 'production']).default('local'),
  port: z.number().positive().default(3000),
  dbUri: z.string().min(1).default('mongodb://localhost:27017/frontendly'),
  corsOrigins: z.array(z.string()).min(1).default(['http://localhost:5173']),
});

type NodeEnv = 'local' | 'development' | 'production';

type CommonConfigType = z.infer<typeof commonConfigSchema>;

export const commonConfigObj = registerAs('common', () => {
  const config: CommonConfigType = {
    nodeEnv: (process.env.NODE_ENV as NodeEnv) || 'local',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/frontendly',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'],
  };
  return commonConfigSchema.parse(config);
});

export type CommonConfig = ConfigType<typeof commonConfigObj>;
