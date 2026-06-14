import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { OAuth2Client } from 'google-auth-library';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  GoogleAuthController,
  LogoutController,
  RefreshTokenController,
} from './controllers';
import { WsAuthMiddleware } from './middlewares';
import { Token, TokenSchema } from './schemas';
import { Session, SessionSchema } from './schemas/session.schema';
import { GoogleAuthService, TokenService } from './services';
import { AuthConfig, authConfigObj } from '@/common/config';
import { EmailModule } from '@/common/email/email.module';
import { User, UserSchema } from '@/users/schemas';
import {
  StageProgress,
  StageProgressSchema,
} from '@/users/schemas/stage-progress.schema';
import { UserModule } from '@/users/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    EmailModule,
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema },
      { name: StageProgress.name, schema: StageProgressSchema },
    ]),
    JwtModule.registerAsync({
      inject: [authConfigObj.KEY],
      useFactory: (authConfig: AuthConfig) => ({
        secret: authConfig.jwtSecret,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [
    GoogleAuthController,
    LogoutController,
    RefreshTokenController,
    AuthController,
  ],
  providers: [
    AuthService,
    GoogleAuthService,
    TokenService,
    WsAuthMiddleware,
    {
      provide: OAuth2Client,
      inject: [authConfigObj.KEY],
      useFactory: (authConfig: AuthConfig): OAuth2Client =>
        new OAuth2Client({
          clientId: authConfig.google.clientId,
          clientSecret: authConfig.google.clientSecret,
        }),
    },
  ],
  exports: [AuthService, JwtModule, TokenService, WsAuthMiddleware],
})
export class AuthModule {}
