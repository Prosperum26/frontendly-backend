export type EntranceQuestionType = 'multiple-choice' | 'single-choice' | 'code';

export interface EntranceTestQuestion {
  id: string;
  question: string;
  type: EntranceQuestionType;
  options?: string[];
  starterCode?: {
    html?: string;
    css?: string;
    js?: string;
    jsx?: string;
  };
}

export interface EntranceTestResult {
  skipToMilestoneId: string;
  skillId: string;
  score: number;
  totalQuestions: number;
}
