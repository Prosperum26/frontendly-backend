import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { testApp, testModule } from '@test-helpers/setup-integration';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import * as request from 'supertest';

import { MockUserBuilder } from '@/users/mocks';
import { User } from '@/users/schemas';

const mockUser = new MockUserBuilder().build();

describe('Testing Google auth APIs', () => {
  let userModel: Model<User>;
  let oauth2Client: DeepMocked<OAuth2Client>;

  beforeAll(() => {
    userModel = testModule.get<Model<User>>(getModelToken(User.name));
    oauth2Client = testModule.get(OAuth2Client);
  });

  describe('POST /api/v1/auth/google', () => {
    it('Should return 200 OK with an access token and insert new user, if given valid idToken', async () => {
      const ticket = createMock<LoginTicket>();
      oauth2Client.verifyIdToken.mockResolvedValueOnce(<never>ticket);
      ticket.getPayload.mockReturnValueOnce({
        iss: 'accounts.google.com',
        aud: 'audience',
        iat: 1111111111,
        exp: 2222222222,
        family_name: mockUser.lastName,
        given_name: mockUser.firstName,
        email: mockUser.email,
        picture: mockUser.avatarUrl,
        sub: mockUser.googleId,
      });

      const res = await request(testApp.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: '123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');

      // Check for that user in the database
      const user = await userModel
        .findOne({ googleId: mockUser.googleId })
        .lean();
      expect(user).toBeTruthy();
      expect(user?.lastName).toBe(mockUser.lastName);
      expect(user?.firstName).toBe(mockUser.firstName);
      expect(user?.email).toBe(mockUser.email);
      expect(user?.avatarUrl).toBe(mockUser.avatarUrl);
      expect(user?.googleId).toBe(mockUser.googleId);
    });
  });
});
