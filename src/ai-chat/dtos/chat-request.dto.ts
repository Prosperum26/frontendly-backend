import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  exerciseId!: string;

  @IsString()
  @IsNotEmpty()
  userCode!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  exerciseTitle?: string;

  @IsString()
  @IsOptional()
  exerciseDescription?: string;

  @IsString()
  @IsOptional()
  codeTest?: string;
}
