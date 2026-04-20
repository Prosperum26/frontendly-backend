import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const observabilityConfigSchema = z.object({
  mem: z.object({
    heapThresholdBytes: z.number().positive(),
  }),
});

type ObservabilityConfigType = z.infer<typeof observabilityConfigSchema>;

export const observabilityConfigObj = registerAs('o11y', () => {
  const config: ObservabilityConfigType = {
    mem: {
      heapThresholdBytes:
        parseInt(process.env.O11Y_HEAP_THRESHOLD_BYTES, 10) ||
        // Let's use a default threshold of 150MB
        150 * 1024 * 1024,
    },
  };
  observabilityConfigSchema.parse(config);
  return config;
});

export type ObservabilityConfig = ConfigType<typeof observabilityConfigObj>;
