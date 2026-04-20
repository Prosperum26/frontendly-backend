import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { MetricsService } from '../services';
import { Metrics } from '../types';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const { method } = request;
    const route = request.route.path;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const durationSecond = (Date.now() - startTime) / 1000;

        const metricsDto: Metrics = {
          method,
          route,
          statusCode,
          durationSecond,
        };

        this.metricsService.recordMetrics(metricsDto);
      }),
      catchError((error: HttpException | Error): Observable<never> => {
        let statusCode = 500;
        if (error instanceof HttpException) {
          statusCode = error.getStatus();
        }

        const durationSecond = (Date.now() - startTime) / 1000;
        const metricsDto: Metrics = {
          method,
          route,
          statusCode,
          durationSecond,
        };

        this.metricsService.recordMetrics(metricsDto);

        return throwError(() => error);
      }),
    );
  }
}
