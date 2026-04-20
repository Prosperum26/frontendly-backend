import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { register } from 'prom-client';

import { ConfigureAuth } from '@/auth/decorators';

@Controller({
  version: VERSION_NEUTRAL,
  path: 'metrics',
})
export class MetricsController extends PrometheusController {
  @Get()
  @ConfigureAuth({ skipAuth: true })
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
