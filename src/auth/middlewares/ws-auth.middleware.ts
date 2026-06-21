import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { ExtendedError, Socket } from 'socket.io';

import { Token } from '../schemas';
import { TokenService } from '../services';
import { User } from '@/users/schemas';

/**
 * Local type extending Socket to include the authenticated user data
 */
interface AuthenticatedSocket extends Socket {
  user?: {
    token: Token;
    profile: User;
  };
}

/**
 * Authenticate incoming WS connections, and attach the user to `socket.user`
 * However, if authentication fails, the connection will **NOT** be rejected.
 * Instead, `socket.user` will be `undefined`.
 *
 * This is because authentication happens *only at the start* of one
 * connection, which may span multiple events. Picking which event to be
 * authenticated is not possible, so we let the programmer decide manually.
 */
@Injectable()
export class WsAuthMiddleware {
  private readonly logger: Logger = new Logger(WsAuthMiddleware.name);

  constructor(private readonly tokenService: TokenService) {}

  async authenticate(
    socket: AuthenticatedSocket,
    next: (err?: ExtendedError) => void,
  ): Promise<void> {
    try {
      const bearer =
        socket.handshake.headers.authorization?.split(' ')[1] || '';
      if (!bearer) {
        throw new WsException('No token was provided in request header');
      }

      let tokenId: string;
      try {
        const decoded = await this.tokenService.decodeAccessToken(bearer);
        tokenId = decoded.tokenId;
      } catch {
        throw new WsException(
          'Your session has expired. Please sign in again.',
        );
      }

      const token = await this.tokenService.findAndValidateToken(
        new Types.ObjectId(tokenId),
      );
      if (!token) {
        throw new WsException('Invalid or expired token');
      }

      const user = await this.tokenService.findUserByToken(token._id);

      if (user.isBanned) {
        throw new WsException('User is banned from accessing this resource');
      }

      if (user.isSuspended) {
        throw new WsException('User account is suspended');
      }

      if (user.isDeleted) {
        throw new WsException('User account has been deleted');
      }

      // Attach the user to the socket object
      socket.user = {
        token,
        profile: user,
      };
      this.logger.log(`Authenticated user ${user.email}`);
    } catch (err) {
      this.logger.error(`Authentication failed. Reason: ${err}`);
    }
    next();
  }
}
