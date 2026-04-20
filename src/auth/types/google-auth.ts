import { User } from '@/users/schemas';

export type GoogleAuthResult = {
  user: User;
  accessToken: string;
};
