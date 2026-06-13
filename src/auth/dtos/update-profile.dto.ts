import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 30) // Bắt buộc tên nếu sửa phải từ 3 đến 30 ký tự
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
