import { Expose } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class GoogleLoginRequestDto {
  @IsString()
  idToken: string;

  @IsString()
  @IsOptional()
  redirectUrl?: string;
}

export class GoogleLoginResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  user: any;

  @Expose()
  isNewUser: boolean;

  constructor(
    accessToken: string,
    user: any,
    refreshToken?: string,
    isNewUser: boolean = false,
  ) {
    this.accessToken = accessToken;
    this.user = user;
    this.refreshToken = refreshToken;
    this.isNewUser = isNewUser;
  }
}
