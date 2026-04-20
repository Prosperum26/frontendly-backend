import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { merge } from 'lodash';
import { Types } from 'mongoose';

import { TokenService } from '../services';
import { AuthOption } from '../types';
import { CustomDecoratorKey } from '@/common/constants';

/**
 * Implements main request authentication logic. The behaviour of this guard
 * can be altered using `{@link @ConfigureAuth}`. The order of checks is as follows:
 * 1) Do a fast return if the user wishes to skip authentication
 * 2) Try to authenticate using the provided token (extracted from the request
 * headers)
 * 3) If the authentication succeeds, attach the user to the request object
 * along with the token used for authentication
 * 4) If the authentication fails, `blockIfUnauthenticated` is checked. If it's
 * set to `true`, the request is blocked. Otherwise, the request is allowed to
 * pass through (no user is attached to the request object in this case)
 *
 * Default value of configs:
 * - `blockIfUnauthenticated`: `true`
 * - `skipAuth`: `false`
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGuard.name);

  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const opt = this.getAuthOption(ctx);
    const req: Request = ctx.switchToHttp().getRequest();
    try {
      if (opt.skipAuth) return true;

      const rawToken = this.getAuthToken(ctx);
      if (!rawToken) {
        throw new UnauthorizedException(
          'No token was provided in request header',
        );
      }
      const { tokenId } = await this.tokenService.decodeAccessToken(rawToken);
      const token = await this.tokenService.findAndValidateToken(
        new Types.ObjectId(tokenId),
      );
      if (!token) {
        throw new UnauthorizedException('Invalid token provided');
      }
      const user = await this.tokenService.findUserByToken(token._id);

      // Attach the user to the request object
      req.user = {
        token,
        profile: user,
      };
      return true;
    } catch (err) {
      this.logger.error(`Authentication failed. Reason: ${err}`);
      if (opt.blockIfUnauthenticated) {
        throw new UnauthorizedException();
      }
      return true;
    }
  }

  private getAuthOption(ctx: ExecutionContext): Required<AuthOption> {
    const defaultOpt: Required<AuthOption> = {
      blockIfUnauthenticated: true,
      skipAuth: false,
    };
    const opt = this.reflector.get<AuthOption>(
      CustomDecoratorKey.AUTH_OPTION,
      ctx.getHandler(),
    );
    return merge(defaultOpt, opt);
  }

  private getAuthToken(ctx: ExecutionContext): string | undefined {
    const req: Request = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization || '';
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token) return undefined;
    return token;
  }
}
