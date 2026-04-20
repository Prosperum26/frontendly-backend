import { z } from 'zod';

import { User } from '../schemas';

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  picture: z.string().optional(),
  googleId: z.string().optional(),
});

export type CreateUserOptions = z.infer<typeof createUserSchema>;

export type CreateOrUpdateUserResult = {
  alreadyExists: boolean;
  user: User;
};
