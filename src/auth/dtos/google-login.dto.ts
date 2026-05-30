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

  constructor(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
