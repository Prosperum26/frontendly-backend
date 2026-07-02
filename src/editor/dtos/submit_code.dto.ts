import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsOptional, IsArray } from 'class-validator';

export class EditorFileDto {
  @IsString()
  filename!: string;

  @IsString()
  language!: string;

  @IsString()
  content!: string;
}

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

  @IsArray()
  @IsOptional()
  @Type(() => EditorFileDto)
  files!: EditorFileDto[];
}

export class SubmitCodeDto {
  @ValidateNested()
  @Type(() => EditorContentDto)
  editorContent!: EditorContentDto;
}
