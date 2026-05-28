import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ExtractJwt, Strategy } from 'passport-jwt';

import { authConfigObj, AuthConfig } from '@/common/config';
import { User } from '@/users/schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfigObj.KEY) private authConfig: AuthConfig,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret || 'FrontendlySecretKey123',
    });
  }

  async validate(payload: {
    id: string;
    email: string;
  }): Promise<Record<string, unknown>> {
    const user = await this.userModel.findById(payload.id).lean();
    if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản');

    const userDoc = <Record<string, unknown>>(<unknown>user);
    // eslint-disable-next-line @typescript-eslint/naming-convention, sonarjs/no-unused-vars
    const { password: _password, ...result } = userDoc;

    return result;
  }
}
