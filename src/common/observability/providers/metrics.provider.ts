import { Provider } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  makeSummaryProvider,
} from '@willsoto/nestjs-prometheus';

export const metricsProviders: Provider[] = [
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route'],
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  }),
  makeSummaryProvider({
    name: 'http_request_duration_percentiles',
    help: 'HTTP request duration percentiles',
    labelNames: ['method', 'route'],
    percentiles: [0.1, 0.5, 0.9, 0.99],
  }),
  makeCounterProvider({
    name: 'http_response_status_codes',
    help: 'HTTP response status codes',
    labelNames: ['method', 'route', 'status_code'],
  }),
];
