import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { OAuth2Client } from 'google-auth-library';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthController } from './controllers';
import { WsAuthMiddleware } from './middlewares';
import { Token, TokenSchema } from './schemas';
import { GoogleAuthService, TokenService } from './services';
import { AuthConfig, authConfigObj } from '@/common/config';
import { User, UserSchema } from '@/users/schemas';
import { UserModule } from '@/users/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      inject: [authConfigObj.KEY],
      useFactory: (authConfig: AuthConfig) => ({
        secret: authConfig.jwtSecret || 'FrontendlySecretKey123',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [GoogleAuthController, AuthController],
  providers: [
    TokenService,
    GoogleAuthService,
    {
      provide: OAuth2Client,
      inject: [authConfigObj.KEY],
      useFactory: (authConfig: AuthConfig): OAuth2Client =>
        new OAuth2Client({
          clientId: authConfig.google.clientId,
          clientSecret: authConfig.google.clientSecret,
        }),
    },
    WsAuthMiddleware,
    AuthService,
  ],
  exports: [TokenService, WsAuthMiddleware, JwtModule],
})
export class AuthModule {}
