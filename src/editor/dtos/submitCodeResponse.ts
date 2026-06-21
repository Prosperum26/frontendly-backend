import { BehaviorEvaluationDto } from './behavior.dto';
import { LintEvaluation } from './lint_evaluators.dto';
import { RequirmentsEvaluationDto } from './requirement_evaluators';
import { VisualEvaluationDto } from './visual_regression.dto';

export class SubmitResponse {
  isCompleted!: boolean;
  match_percentage!: number;
  lint_errors!: LintEvaluation;
  requirementResult!: RequirmentsEvaluationDto[];
  visual_results?: VisualEvaluationDto[];
  behavior_results?: BehaviorEvaluationDto | null;
}
