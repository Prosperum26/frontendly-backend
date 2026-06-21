import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsOptional } from 'class-validator';
export class EditorContentDto {
  // lấy code của user từ API
  @IsString()
  @IsOptional()
  html!: string;

  @IsString()
  @IsOptional()
  css!: string;

  @IsString()
  @IsOptional()
  js!: string;

  @IsString()
  @IsOptional()
  jsx!: string;
}
export class SubmitCodeDto {
  @ValidateNested()
  @Type(() => EditorContentDto)
  editorContent!: EditorContentDto;
}
