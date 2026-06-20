import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { merge } from 'lodash';
import { Model, Types } from 'mongoose';

import { TokenService } from '../services';
import { AuthOption } from '../types';
import { CustomDecoratorKey } from '@/common/constants';
import { StageProgress } from '@/users/schemas/stage-progress.schema';

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
    @InjectModel(StageProgress.name)
    private readonly stageProgressModel: Model<StageProgress>,
  ) { }

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

      let tokenId: string;
      try {
        const decoded = await this.tokenService.decodeAccessToken(rawToken);
        tokenId = decoded.tokenId;
      } catch {
        throw new UnauthorizedException('Your session has expired. Please sign in again.');
      }

      const token = await this.tokenService.findAndValidateToken(
        new Types.ObjectId(tokenId),
      );
      if (!token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const user = await this.tokenService.findUserByToken(token._id);

      if (user.isBanned) {
        throw new ForbiddenException(
          'User is banned from accessing this resource',
        );
      }

      if (user.isSuspended) {
        throw new ForbiddenException('User account is suspended');
      }

      if (user.isDeleted) {
        throw new ForbiddenException('User account has been deleted');
      }

      // Verify stage progress to prevent bypassing roadmap
      const stageProgress = await this.stageProgressModel
        .findOne({
          user_id: user._id,
        })
        .lean();

      if (stageProgress) {
        // Attach stage progress to user object for downstream use
        user.stage_progress = stageProgress;
      }

      // Attach the user to the request object
      req.user = {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
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
    const opt = this.reflector.getAllAndOverride<AuthOption>(
      CustomDecoratorKey.AUTH_OPTION,
      [ctx.getHandler(), ctx.getClass()],
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
