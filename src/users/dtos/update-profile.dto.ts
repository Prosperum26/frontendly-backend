import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsUrl,
  Matches,
  IsEnum,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'Tên không được vượt quá 50 ký tự' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Tên chỉ được chứa chữ cái và khoảng trắng',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Họ phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'Họ không được vượt quá 50 ký tự' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Họ chỉ được chứa chữ cái và khoảng trắng',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Tên đệm phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'Tên đệm không được vượt quá 50 ký tự' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Tên đệm chỉ được chứa chữ cái và khoảng trắng',
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  @MaxLength(30, { message: 'Username không được vượt quá 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar URL phải là một URL hợp lệ' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['user', 'admin', 'moderator'], {
    message: 'Vai trò phải là user, admin hoặc moderator',
  })
  role?: string;
}
