import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { TokenService } from './token.service';
import { MockTokenBuilder } from '../mocks';
import { Token } from '../schemas';
import { authConfigObj } from '@/common/config';
import { ConfigMock } from '@/common/config/mocks';
import { MockUserBuilder } from '@/users/mocks';
import { User } from '@/users/schemas';

const mockUser = new MockUserBuilder().build();

const validToken = new MockTokenBuilder(mockUser).makeValid().build();
const inactiveToken = new MockTokenBuilder(mockUser).makeInactive().build();
const expiredToken = new MockTokenBuilder(mockUser).makeExpired().build();

describe('TokenService', () => {
  let tokenService: TokenService;
  let tokenModel: DeepMocked<Model<Token>>;

  beforeAll(async () => {
    tokenModel = createMock<Model<Token>>();
    const userService = createMock<Model<User>>();
    const mod = await Test.createTestingModule({
      providers: [
        TokenService,
        JwtService,
        {
          provide: getModelToken(Token.name),
          useValue: tokenModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: userService,
        },
        {
          provide: authConfigObj.KEY,
          useValue: ConfigMock.getAuthConfig(),
        },
      ],
    }).compile();
    tokenService = mod.get(TokenService);
  });

  it('Should be able to sign and decode its own token', async () => {
    const accessToken = await tokenService.signAccessToken(validToken);
    const decodedToken = await tokenService.decodeAccessToken(accessToken);
    expect(decodedToken.tokenId).toBe(validToken._id.toString());
  });

  describe('Finding user attached to token', () => {
    test('Token is not found', async () => {
      (<jest.Mock>(
        tokenModel.findById(validToken._id).populate('userId').lean
      )).mockResolvedValueOnce(null);
      await expect(
        tokenService.findUserByToken(validToken._id),
      ).rejects.toThrow(UnauthorizedException);
    });

    test('Existing token found', async () => {
      (<jest.Mock>(
        tokenModel.findById(validToken._id).populate('userId').lean
      )).mockResolvedValueOnce({ ...validToken, userId: mockUser });
      const user = await tokenService.findUserByToken(validToken._id);
      expect(user).toEqual(mockUser);
    });
  });

  describe('Testing token validity, given the token ID', () => {
    it('Should return null if the token is not found', async () => {
      (<jest.Mock>(
        tokenModel.findById(validToken._id).lean
      )).mockResolvedValueOnce(null);
      const token = await tokenService.findAndValidateToken(validToken._id);
      expect(token).toBeNull();
    });

    it("Should return the token if it's still active, and not expired", async () => {
      (<jest.Mock>(
        tokenModel.findById(validToken._id).lean
      )).mockResolvedValueOnce(validToken);
      const token = await tokenService.findAndValidateToken(validToken._id);
      expect(token).toEqual(validToken);
    });

    it('Should return null if the token is inactive', async () => {
      (<jest.Mock>(
        tokenModel.findById(inactiveToken._id).lean
      )).mockResolvedValueOnce(inactiveToken);
      const token = await tokenService.findAndValidateToken(inactiveToken._id);
      expect(token).toBeNull();
    });

    it('Should return null if the token is passed its expiry date', async () => {
      (<jest.Mock>(
        tokenModel.findById(expiredToken._id).lean
      )).mockResolvedValueOnce(expiredToken);
      const token = await tokenService.findAndValidateToken(expiredToken._id);
      expect(token).toBeNull();
    });
  });
});
