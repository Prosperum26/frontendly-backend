import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Token } from '@/auth/schemas';
import { User } from '@/users/schemas';

/**
 * Util function to clear database between each test
 */
export async function clearDatabase(mod: TestingModule): Promise<void> {
  const tokenModel = mod.get<Model<Token>>(getModelToken(Token.name));
  const userModel = mod.get<Model<User>>(getModelToken(User.name));

  await tokenModel.deleteMany({});
  await userModel.deleteMany({});
}
