import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const observabilityConfigSchema = z.object({
  mem: z.object({
    heapThresholdBytes: z.coerce.number().positive(),
  }),
});

export const observabilityConfigObj = registerAs('o11y', () => {
  return observabilityConfigSchema.parse({
    mem: {
      heapThresholdBytes: process.env.O11Y_HEAP_THRESHOLD_BYTES,
    },
  });
});

export type ObservabilityConfig = ConfigType<typeof observabilityConfigObj>;
