import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
export class EditorContentDto {
  @IsString()
  @IsNotEmpty({ message: 'Invalid HTML' })
  html!: string;

  @IsString()
  @IsOptional()
  css!: string;

  @IsString()
  @IsOptional()
  javascript!: string;
}
export class SubmitCodeDto {
  @ValidateNested()
  @Type(() => EditorContentDto)
  editorContent!: EditorContentDto;
}
