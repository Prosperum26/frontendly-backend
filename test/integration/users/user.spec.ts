import { getModelToken } from '@nestjs/mongoose';
import { testApp, testModule } from '@test-helpers/setup-integration';
import { signAccessToken } from '@test-helpers/token';
import { Model } from 'mongoose';
import * as request from 'supertest';

import { MockTokenBuilder } from '@/auth/mocks';
import { Token } from '@/auth/schemas';
import { MockUserBuilder } from '@/users/mocks';
import { User } from '@/users/schemas';

const mockUser = new MockUserBuilder().build();
const validToken = new MockTokenBuilder(mockUser).makeValid().build();

describe('User APIs', () => {
  let userModel: Model<User>;
  let tokenModel: Model<Token>;

  beforeAll(() => {
    userModel = testModule.get<Model<User>>(getModelToken(User.name));
    tokenModel = testModule.get<Model<Token>>(getModelToken(Token.name));
  });

  beforeEach(async () => {
    // Prepare a default user in the database for testing
    await userModel.create(mockUser);
    await tokenModel.create(validToken);
  });

  describe('GET /api/v1/users/me', () => {
    it('Should return current user profile with required fields', async () => {
      const accessToken = await signAccessToken(testModule, validToken);

      const res = await request(testApp.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        avatarUrl: mockUser.avatarUrl,
      });
    });
  });
});
