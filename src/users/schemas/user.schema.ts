import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // Nếu file cũ của bạn có firstName, lastName hay avatarUrl,
  // bạn cứ giữ nguyên chúng ở dưới này nhé, chỉ cần thêm name và bio lên trên là được.
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
