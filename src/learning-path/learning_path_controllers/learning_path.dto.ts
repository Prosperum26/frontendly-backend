import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SubmitCodeDto {
  @IsObject()
  @IsNotEmpty()
  submittedCode!: {
    html: string;
    js: string;
  };
}

export class GetRoadmapQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 5;
}

export class CompleteStageDto {}

export class UnlockPracticeDto {}

// Phase 2: PATCH /stages/:stageId/video-progress
export class VideoProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  watchPercentage!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  seekPercentage?: number;
}

// Phase 2: POST /learning-content/sync-placement-test
export class PlacementTestDto {
  @IsString()
  @IsNotEmpty()
  skipToMilestoneId!: string;

  @IsOptional()
  @IsString()
  skillId?: string;

  @IsOptional()
  learningPath?: Array<{
    canonicalLessonId: string;
    stageId?: string;
    exerciseId: string;
    status: 'auto_passed' | 'required' | 'locked';
  }>;

  @IsOptional()
  studyPlan?: string[];
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

export class ApiResponseDto<T = any> {
  success!: boolean;
  message!: string;
  data!: T;
}

export class PaginationDto {
  currentPage!: number;
  limit!: number;
  totalItems!: number;
  totalPages!: number;
}

export class UserProgressDto {
  currentXp!: number;
  streakDays!: number;
}

export class ApiStageDto {
  id!: string;
  title!: string;
  isCompleted!: boolean;
  earnedStars!: number;
}

export class ApiMilestoneDto {
  id!: string;
  title!: string;
  status!: 'locked' | 'in_progress' | 'completed';
  stages!: ApiStageDto[];
}

export class RoadmapResponseDto {
  skillId!: string;
  skillTitle!: string;
  userProgress!: UserProgressDto;
  milestones!: ApiMilestoneDto[];
  pagination?: PaginationDto;
}

export class TheoryResponseDto {
  stageId!: string;
  title!: string;
  contentHtml!: string;
  proTips!: string;
  videoUrl!: string;
  referenceLinks!: Array<{ title: string; url: string; type: 'doc' | 'video' }>;
}

export class ExerciseResponseDto {
  id!: string;
  stageId!: string;
  level!: 'easy' | 'medium' | 'hard';
  title!: string;
  instruction!: string;
  boilerplateCode!: { html: string; js: string };
}

export class SubmitCodeResponseDto {
  stageId!: string;
  isPracticeUnlocked!: boolean;
  earnedStars!: number;
  xpReward!: number;
}

export class VideoProgressResponseDto {
  stageId!: string;
  videoWatchPercentage!: number;
  xpAwarded?: number;
}

export class SkillDto {
  skillId!: string;
  skillTitle!: string;
}

export class FullStageContentDto {
  theory?: TheoryResponseDto;
  exercises?: ExerciseResponseDto[];
}

export class ProgressSummaryDto {
  currentXp!: number;
  streakDays!: number;
  completedStages!: number;
  totalStages!: number;
  completedMilestones!: number;
  totalMilestones!: number;
}

export class PlacementTestResponseDto {
  placementTestCompleted!: boolean;
  skipToMilestoneId!: string;
}
