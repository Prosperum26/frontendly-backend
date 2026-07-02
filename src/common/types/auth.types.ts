import { Token } from '@/auth/schemas';
import { User } from '@/users/schemas';

export interface AuthenticatedHttpUser {
  userId: string;
  username: string;
  role: string;
  token: Token;
  profile: User;
}
