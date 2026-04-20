import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GoogleLoginRequestDto {
  @IsString()
  idToken: string;
}

export class GoogleLoginResponseDto {
  @Expose()
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
