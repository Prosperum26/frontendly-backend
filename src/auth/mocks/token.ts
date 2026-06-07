import { Types } from 'mongoose';

import { Token } from '../schemas';
import { DecodedJwt } from '../types';
import { User } from '@/users/schemas';

export class MockTokenBuilder {
  private token: Token;

  constructor(user: User) {
    this.token = {
      _id: new Types.ObjectId(),
      userId: user._id,
      isActive: true,
      expiredAt: MockTokenBuilder.getFutureDate(),
    };
  }

  public static getDecodedJwt(t: Token): DecodedJwt {
    return {
      tokenId: t._id.toString(),
    };
  }

  private static getFutureDate(): Date {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  private static getPastDate(): Date {
    return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  }

  public build(): Token {
    return this.token;
  }

  public makeValid(): MockTokenBuilder {
    this.token.isActive = true;
    this.token.expiredAt = MockTokenBuilder.getFutureDate();
    return this;
  }

  public makeInactive(): MockTokenBuilder {
    this.token.isActive = false;
    this.token.expiredAt = MockTokenBuilder.getFutureDate();
    return this;
  }

  public makeExpired(): MockTokenBuilder {
    this.token.isActive = true;
    this.token.expiredAt = MockTokenBuilder.getPastDate();
    return this;
  }
}
