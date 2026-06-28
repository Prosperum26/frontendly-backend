import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = HttpStatus[statusCode] ?? 'Error';
    } else {
      const body = <Record<string, unknown>>exceptionResponse;
      message = <string>body.message ?? exception.message;
      error = <string>body.error ?? HttpStatus[statusCode] ?? 'Error';
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      error,
      message,
    });
  }
}
