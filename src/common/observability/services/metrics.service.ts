import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Summary } from 'prom-client';

import { Metrics } from '../types';

enum StatusCodeType {
  CLIENT_ERROR = '4xx',
  SERVER_ERROR = '5xx',
  SUCCESS = '2xx',
  REDIRECT = '3xx',
  INFORMATION = '1xx',
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsCounter: Counter,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDurationHistogram: Histogram,
    @InjectMetric('http_request_duration_percentiles')
    private readonly httpRequestDurationSummary: Summary,
    @InjectMetric('http_response_status_codes')
    private readonly httpStatusCodesCounter: Counter,
  ) {}

  recordMetrics(metricsData: Metrics): void {
    const { method, route, statusCode, durationSecond } = metricsData;

    this.httpRequestsCounter.inc();

    this.httpRequestsCounter.inc({ method, route });

    this.httpRequestDurationHistogram.observe(
      { method, route },
      durationSecond,
    );

    this.httpRequestDurationSummary.observe({ method, route }, durationSecond);

    let statusType = StatusCodeType.INFORMATION;
    if (statusCode >= 500) {
      statusType = StatusCodeType.SERVER_ERROR;
    } else if (statusCode >= 400) {
      statusType = StatusCodeType.CLIENT_ERROR;
    } else if (statusCode >= 300) {
      statusType = StatusCodeType.REDIRECT;
    } else if (statusCode >= 200) {
      statusType = StatusCodeType.SUCCESS;
    }

    this.httpStatusCodesCounter.inc({ method, route, status_code: statusType });
  }
}
