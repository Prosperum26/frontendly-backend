import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { instrument } from '@socket.io/admin-ui';
import { Server, Socket } from 'socket.io';

import { WsAuthMiddleware } from '@/auth/middlewares';
import { CommonConfig, commonConfigObj } from '@/common/config';
import { AuthenticatedHttpUser } from '@/common/types/auth.types';

interface AuthenticatedSocket extends Socket {
  user?: AuthenticatedHttpUser;
}

/**
 * This gateway subscribes to the users namespace and listens for 'hello'
 * events. It logs the event and sends a 'world' event back to the client.
 *
 * This is only intended to be an example of how to use a gateway in this
 * template.
 */
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class UserGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger: Logger = new Logger(UserGateway.name);

  constructor(
    @Inject(commonConfigObj.KEY) private readonly commonConfig: CommonConfig,
    private readonly wsAuth: WsAuthMiddleware,
  ) {}

  @SubscribeMessage('hello')
  handleHello(): string {
    return 'world';
  }

  afterInit(server: Server): void {
    if (this.commonConfig.nodeEnv === 'local') {
      instrument(server, {
        // This is safe since we're testing locally
        auth: false,
        mode: 'development',
      });
    }
    server.use(this.wsAuth.authenticate.bind(this.wsAuth));
  }

  handleConnection(@ConnectedSocket() socket: AuthenticatedSocket): void {
    if (socket.user?.profile) {
      const name = `${socket.user.profile.firstName} ${socket.user.profile.lastName}`;
      this.logger.log(
        `Client connected: ${socket.user.profile._id.toString()} (${name}). Session ID: ${socket.id}`,
      );
    } else {
      this.logger.log(
        `Client connected (unauthenticated). Session ID: ${socket.id}`,
      );
    }
  }

  handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket): void {
    if (socket.user?.profile) {
      const name = `${socket.user.profile.firstName} ${socket.user.profile.lastName}`;
      this.logger.log(
        `Client disconnected: ${socket.user.profile._id.toString()} (${name}). Session ID ${socket.id}. Reason: ${socket.handshake.query.reason}`,
      );
    } else {
      this.logger.log(
        `Client disconnected (unauthenticated). Session ID ${socket.id}. Reason: ${socket.handshake.query.reason}`,
      );
    }
  }
}
