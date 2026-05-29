import { IsArray, IsOptional } from 'class-validator';

export class LintEvaluation {  // trả result checkLint
  @IsArray()
  @IsOptional()
  html_err?: { line: number; message: string }[];

  @IsArray()
  @IsOptional()
  css_err?: { line: number; message: string }[];

  @IsArray()
  @IsOptional()
  js_err?: { line: number; message: string }[];
}
