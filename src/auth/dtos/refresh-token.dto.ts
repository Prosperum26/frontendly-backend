import { IsNotEmpty, IsString } from 'class-validator';

import { RefreshTokenDto } from './dtos/refresh-token.dto';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
