import { LintEvaluation } from './lint_evaluators.dto';
import { RequirmentsEvaluationDto } from './requirement_evaluators';

export class SubmitResponse {  // trả result qua API
    isCompleted!: boolean;
    match_percentage!: number;
    lint_errors!: LintEvaluation;
    evaluationResults!: RequirmentsEvaluationDto[];
}