import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class GuestStageProgressDto {
  @IsString()
  @IsNotEmpty()
  stageId!: string;

  @IsBoolean()
  theoryViewed!: boolean;

  @IsNumber()
  viewedAt!: number;
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestStageProgressDto)
  guestProgress?: GuestStageProgressDto[];
}
