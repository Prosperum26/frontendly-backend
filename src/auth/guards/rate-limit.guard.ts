import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuthConfig, authConfigObj } from '@/common/config';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly rateLimitMap = new Map<string, RateLimitInfo>();

  constructor(
    private reflector: Reflector,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const now = Date.now();
    const windowMs = this.authConfig.rateLimitWindowMinutes * 60 * 1000;
    const maxAttempts = this.authConfig.rateLimitMaxAttempts;

    // Get or create rate limit info for this IP
    let rateLimitInfo = this.rateLimitMap.get(ip);

    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      // Reset if window expired or first time
      rateLimitInfo = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.rateLimitMap.set(ip, rateLimitInfo);
      return true;
    }

    // Increment count
    rateLimitInfo.count++;

    if (rateLimitInfo.count > maxAttempts) {
      const remainingTime = Math.ceil(
        (rateLimitInfo.resetTime - now) / 1000 / 60,
      );
      throw new HttpException(
        `Too many login attempts. Please try again in ${remainingTime} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    let ip: string | undefined;
    if (forwarded) {
      if (Array.isArray(forwarded)) {
        ip = forwarded[0];
      } else {
        ip = forwarded.split(',')[0];
      }
    } else {
      ip = request.socket.remoteAddress;
    }
    return ip || 'unknown';
  }
}
