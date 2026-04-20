import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { HealthController, MetricsController } from './controllers';
import { metricsProviders } from './providers';
import { MetricsService } from './services';

@Module({
  imports: [
    TerminusModule,
    PrometheusModule.register({ controller: MetricsController }),
  ],
  controllers: [HealthController],
  providers: [MetricsService, ...metricsProviders],
  exports: [MetricsService],
})
export class ObservabilityModule {}
