import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GoogleLoginRequestDto {
  @IsString()
  idToken: string;
}

export class GoogleLoginResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  user: any;

  constructor(accessToken: string, user: any, refreshToken?: string) {
    this.accessToken = accessToken;
    this.user = user;
    this.refreshToken = refreshToken;
  }
}
