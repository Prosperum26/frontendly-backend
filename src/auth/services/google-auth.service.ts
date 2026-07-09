import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { GoogleAuthResult } from '../types';
import { TokenService } from './token.service';
import { AuthConfig, authConfigObj } from '@/common/config';
import { UserService } from '@/users/services';
import { GamificationService } from '@/users/services/gamification.service';

@Injectable()
export class GoogleAuthService {
  private readonly logger: Logger = new Logger(GoogleAuthService.name);

  constructor(
    private readonly oauth2Client: OAuth2Client,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly gamificationService: GamificationService,
  ) {}

  public async authenticate(
    idToken: string,
    res: Response,
  ): Promise<GoogleAuthResult> {
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken,
      audience: this.authConfig.google.clientId,
    });
    const {
      family_name: lastName,
      given_name: firstName,
      email,
      picture,
      sub: googleId,
    } = ticket.getPayload()!;

    // It's safe to assume that `email` exists, since it should be provided if
    // the scope included the string "email".
    const { user, alreadyExists } = await this.userService.createOrUpdateUser({
      email: email!,
      googleId,
      firstName,
      lastName,
      picture,
    });

    this.logger.log(
      `Google auth: ${alreadyExists ? 'Existing user' : 'New user'} authenticated - ${email}`,
    );

    // Generate token for this authentication attempt
    const token = await this.tokenService.create(user._id);
    const accessToken = await this.tokenService.signAccessToken(token);

    // Create session with refresh token and set HttpOnly cookie
    const userAgent = res.req.headers['user-agent'] || 'unknown';
    const { refreshToken, expiresAt } = await this.tokenService.createSession(
      user._id,
      userAgent,
      7, // Default 7 days for Google auth
    );

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });

    // Set access token in HttpOnly cookie
    const accessExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: accessExpires,
    });

    // Handle daily check-in
    const dailyCheckIn = await this.gamificationService.dailyCheckIn(user._id);

    return {
      user,
      accessToken,
      refreshToken,
      isNewUser: !alreadyExists,
      dailyCheckIn,
    };
  }
}
