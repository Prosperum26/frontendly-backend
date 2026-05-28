import { IsNotEmpty, IsObject } from 'class-validator';

export class SubmitCodeDto {
  @IsObject()
  @IsNotEmpty()
  submittedCode: {
    html: string;
    js: string;
  };
}

export class GetRoadmapQueryDto {
  page?: number = 1;
  limit?: number = 5;
}
