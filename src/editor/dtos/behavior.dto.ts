import {
  IsBoolean,
  IsNumber,
  IsArray,
  IsString,
  IsOptional,
} from 'class-validator';

export class BehaviorEvaluationDto {
  @IsBoolean()
  passed!: boolean;

  @IsNumber()
  totalTests!: number;

  @IsNumber()
  passedTests!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  errors!: string;
}
