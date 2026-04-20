import { Token } from '@/auth/schemas';
import { User } from '@/users/schemas';

declare module 'socket.io' {
  interface Socket {
    user?: AuthenticatedWsUser;
  }

  interface AuthenticatedWsUser {
    token: Token;
    profile: User;
  }
}
