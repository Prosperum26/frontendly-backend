import { Inject, Injectable, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

import { GoogleAuthResult } from '../types';
import { TokenService } from './token.service';
import { AuthConfig, authConfigObj } from '@/common/config';
import { UserService } from '@/users/services';

@Injectable()
export class GoogleAuthService {
  private readonly logger: Logger = new Logger(GoogleAuthService.name);

  constructor(
    private readonly oauth2Client: OAuth2Client,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  public async authenticate(idToken: string): Promise<GoogleAuthResult> {
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
    const { user } = await this.userService.createOrUpdateUser({
      email: email!,
      googleId,
      firstName,
      lastName,
      picture,
    });

    // Generate token for this authentication attempt
    const token = await this.tokenService.create(user._id);
    const accessToken = await this.tokenService.signAccessToken(token);
    return {
      user,
      accessToken,
    };
  }
}
