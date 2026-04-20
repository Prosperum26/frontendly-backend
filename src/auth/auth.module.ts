import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { OAuth2Client } from 'google-auth-library';

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
  ],
  controllers: [GoogleAuthController],
  providers: [
    JwtService,
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
  ],
  exports: [TokenService, WsAuthMiddleware],
})
export class AuthModule {}
