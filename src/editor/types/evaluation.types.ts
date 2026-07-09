import { RestrictionDetail } from '../db_schemas/exercise_schema';

export interface RequirementResult {
  requirementId: string;
  passed: boolean;
  message?: string;
}

export interface EvaluationResult {
  isCompleted: boolean;
  match_percentage: number;
  lint_errors: LintError[];
  requirementResult: RequirementResult[];
  visual_results: VisualResult | null;
  behavior_results: BehaviorResult;
}

export interface LintError {
  line: number;
  column: number;
  message: string;
  type: string;
}

export interface VisualResult {
  deviceType: string;
  passed: boolean;
  matchPercentage: number;
  level_of_complete: string;
  diffImageUrl: string | null;
}

export interface BehaviorResult {
  passed: boolean;
  message?: string;
}

export type LintRestriction = RestrictionDetail;
