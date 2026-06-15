import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() avatar?: string; // (Sẽ nhận URL sau khi upload)
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional()
  @IsString()
  username?: string;
}
