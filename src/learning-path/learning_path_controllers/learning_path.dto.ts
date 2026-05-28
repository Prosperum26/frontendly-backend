import { IsNotEmpty, IsNumber, IsObject, IsString, Max, Min } from 'class-validator';

export class SubmitCodeDto {
  @IsObject()
  @IsNotEmpty()
  submittedCode!: {
    html: string;
    js: string;
  };
}

export class GetRoadmapQueryDto {
  page?: number = 1;
  limit?: number = 5;
}

// Phase 2: PATCH /stages/:stageId/video-progress
export class VideoProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  watchPercentage!: number;
}

// Phase 2: POST /learning-content/sync-placement-test
export class PlacementTestDto {
  @IsString()
  @IsNotEmpty()
  skipToMilestoneId!: string;
}
