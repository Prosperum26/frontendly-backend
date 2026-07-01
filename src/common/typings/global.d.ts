import { Token } from '@/auth/schemas';
import { User } from '@/users/schemas';
import { Socket as SocketIOSocket } from 'socket.io';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      DB_URI: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      JWT_SECRET: string;

      O11Y_HEAP_THRESHOLD_BYTES: string;
    }
  }

  namespace Express {
    interface Request {
      user?: AuthenticatedHttpUser;
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    user?: AuthenticatedHttpUser;
  }
}

interface AuthenticatedHttpUser {
  userId: string;
  username: string;
  role: string;
  token: Token;
  profile: User;
}

export { AuthenticatedHttpUser };
