/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Controller, Get, Inject, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

import { ConfigureAuth } from '@/auth/decorators';
import { ObservabilityConfig, observabilityConfigObj } from '@/common/config';

@Controller({
  version: VERSION_NEUTRAL,
  path: 'health',
})
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: MongooseHealthIndicator,
    private readonly mem: MemoryHealthIndicator,
    @Inject(observabilityConfigObj.KEY)
    private readonly o11yConfig: ObservabilityConfig,
  ) {}

  @Get()
  @ConfigureAuth({ skipAuth: true })
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      async () =>
        this.mem.checkHeap(
          'memory_heap',
          this.o11yConfig.mem.heapThresholdBytes,
        ),
    ]);
  }
}
