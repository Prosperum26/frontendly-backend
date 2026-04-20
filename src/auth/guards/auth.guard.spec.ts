/* eslint-disable import/no-extraneous-dependencies */
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request } from 'express';

import { AuthGuard } from './auth.guard';
import { MockTokenBuilder } from '../mocks';
import { TokenService } from '../services';
import { AuthOption } from '../types';
import { MockUserBuilder } from '@/users/mocks';

const mockUser = new MockUserBuilder().build();

const validToken = new MockTokenBuilder(mockUser).makeValid().build();
const decodedJwt = MockTokenBuilder.getDecodedJwt(validToken);

describe('AuthGuard', () => {
  let reflector: DeepMocked<Reflector>;
  let tokenService: DeepMocked<TokenService>;
  let ctx: DeepMocked<ExecutionContext>;
  let req: Request;
  let authGuard: AuthGuard;

  beforeEach(async () => {
    tokenService = createMock<TokenService>();
    reflector = createMock<Reflector>();
    ctx = createMock<ExecutionContext>();
    req = createMock<Request>();
    // We want to test if user is attached to request object
    // after authentication
    req.user = undefined;
    ctx.switchToHttp().getRequest.mockReturnValue(req);
    const mod = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
      ],
    }).compile();
    authGuard = mod.get(AuthGuard);
  });

  it('Should skip authentication if `skipAuth` is set to true', async () => {
    reflector.get.mockReturnValue(<AuthOption>{
      skipAuth: true,
    });
    const res = await authGuard.canActivate(ctx);
    expect(res).toBe(true);
    expect(req.user).toBeUndefined();
  });

  it('Should attach user and token to request if authentication succeeds', async () => {
    req.headers.authorization = 'Bearer 123';
    tokenService.decodeAccessToken.mockResolvedValueOnce(decodedJwt);
    tokenService.findAndValidateToken.mockResolvedValueOnce(validToken);
    tokenService.findUserByToken.mockResolvedValueOnce(mockUser);
    reflector.get.mockReturnValue(<AuthOption>{});

    const res = await authGuard.canActivate(ctx);

    expect(res).toBe(true);
    expect(req.user).toEqual({
      token: validToken,
      profile: mockUser,
    });
  });

  describe('Handling authentication failure', () => {
    it('Should throw an error if no token is provided', async () => {
      req.headers.authorization = '';
      reflector.get.mockReturnValue(<AuthOption>{});
      await expect(authGuard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Should throw an error if invalid token provided', async () => {
      req.headers.authorization = 'Bearer 123';
      tokenService.decodeAccessToken.mockResolvedValueOnce(decodedJwt);
      tokenService.findAndValidateToken.mockResolvedValueOnce(null);
      reflector.get.mockReturnValue(<AuthOption>{});
      await expect(authGuard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Should still allow request if auth fails but `blockIfUnauthenticated` is false', async () => {
      req.headers.authorization = '';
      reflector.get.mockReturnValue(<AuthOption>{
        blockIfUnauthenticated: false,
      });
      const res = await authGuard.canActivate(ctx);
      expect(res).toBe(true);
      expect(req.user).toBeUndefined();
    });
  });
});
