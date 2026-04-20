import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Token } from '../schemas';
import { DecodedJwt } from '../types';
import { AuthConfig, authConfigObj } from '@/common/config';
import { User } from '@/users/schemas';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
  ) {}

  public async signAccessToken(token: Token): Promise<string> {
    const jwt: DecodedJwt = {
      tokenId: token._id.toString(),
    };
    return this.jwtService.signAsync(jwt, {
      secret: this.authConfig.jwtSecret,
    });
  }

  public async decodeAccessToken(token: string): Promise<DecodedJwt> {
    return this.jwtService.verifyAsync<DecodedJwt>(token, {
      secret: this.authConfig.jwtSecret,
    });
  }

  public async create(userId: Types.ObjectId): Promise<Token> {
    return this.tokenModel.create({ userId });
  }

  public async findUserByToken(tokenId: Types.ObjectId): Promise<User> {
    const token = await this.tokenModel
      .findById(tokenId)
      .populate<{ userId: User | null }>('userId')
      .lean();
    if (!token) {
      // It's best to throw 401 here, since most likely, the token is invalid
      // or manually deleted from the database.
      throw new UnauthorizedException('No matching token found');
    }
    if (!token.userId) {
      // This should never happen, so it's best to throw 500 here.
      throw new InternalServerErrorException(
        'Token exists, but no matching user found',
      );
    }
    return token.userId;
  }

  /**
   * Returns the token document if it exists and is valid. Otherwise, returns
   * `null`. Validity is defined as having `isActive` set to `true`, and current
   * date is less than `expiredAt`.
   */
  public async findAndValidateToken(
    tokenId: Types.ObjectId,
  ): Promise<Token | null> {
    const now = new Date();
    const token = await this.tokenModel.findById(tokenId).lean();
    if (!token) return null;
    if (!token.isActive || now >= token.expiredAt) return null;
    return token;
  }
}
