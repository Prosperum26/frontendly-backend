import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { ExtendedError } from 'socket.io';
import { Socket } from 'socket.io/dist/socket';

import { TokenService } from '../services';

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
    socket: Socket,
    next: (err?: ExtendedError) => void,
  ): Promise<void> {
    try {
      const bearer =
        socket.handshake.headers.authorization?.split(' ')[1] || '';
      if (!bearer) {
        throw new WsException('No token was provided in request header');
      }
      const { tokenId } = await this.tokenService.decodeAccessToken(bearer);
      const token = await this.tokenService.findAndValidateToken(
        new Types.ObjectId(tokenId),
      );
      if (!token) {
        throw new WsException('Invalid token provided');
      }
      const user = await this.tokenService.findUserByToken(token._id);

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
