import { IsString, IsOptional, IsDateString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  avatar?: string; // (Sẽ nhận URL sau khi upload)

  @IsOptional()
  @IsString()
  @Matches(/^0[35789]\d{8}$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
