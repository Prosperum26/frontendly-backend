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

// Types from our entrance_test.json
export interface Question {
  id: number;
  competency: 'foundation' | 'styling' | 'component' | 'state';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
}

export interface DifficultyWeight {
  questions: number[];
  weight: number;
}

export interface CriticalGateRule {
  id: string;
  competency: 'foundation' | 'styling' | 'component' | 'state';
  minPercentage: number;
  failReason: string;
}

export interface AdvancementLevel {
  level: 'A' | 'B' | 'C' | 'D' | 'E';
  min: number;
  max: number;
  label: string;
  action: string;
  requiresCompetency?: Record<string, number>;
  requiresAllGatesPass?: boolean;
}

export interface ExampleMapping {
  relatedQuestions: number[];
  note: string;
}

export interface PersonalizationRules {
  description: string;
  competencyToMilestoneThreshold: Record<
    string,
    { milestone: string; autoPassThreshold: number }
  >;
  perExerciseAutoPassAlgorithm: string[];
  exampleMapping: Record<string, ExampleMapping>;
}

export interface EntranceTestData {
  test_id: string;
  title: string;
  questions: Question[];
  questionMapping: Record<string, number[]>;
  difficultyWeight: Record<string, DifficultyWeight>;
  lessonMapping: Record<string, string>;
  lessonToExerciseId: Record<string, string>;
  criticalGateRules: CriticalGateRule[];
  advancementLevels: AdvancementLevel[];
  personalizationRules: PersonalizationRules;
  outputSchemaExample: any;
}

// Exercise types from lessons.json
export interface ExerciseData {
  id: string;
  module: string;
  title: string;
  level: 'easy' | 'medium' | 'hard';
  description: string;
  evaluation_config: {
    lint: boolean;
    requirements: boolean;
    visual: boolean;
    behavior: boolean;
  };
  restrictions: any[];
  tags: string[];
  html_content: string;
  css_content: string;
  js_content: string;
  jsx_content: string;
  target_design: {
    deviceType: string;
    width: number;
    height: number;
  } | null;
  code_test: {
    html: string;
    css: string;
    js: string;
    jsx: string;
  } | null;
  test_script: string | null;
  requirements: { id: string; description: string }[];
  navigation: any;
}

export interface LessonsData {
  lessons: { success: boolean; data: ExerciseData }[];
}

// Theory types from theory.json
export interface TheorySection {
  heading: string;
  content: string;
  code?: string;
}

export interface TheoryLesson {
  lessonId: string;
  order: number;
  title: string;
  relatedExerciseIds: string[];
  sections: TheorySection[];
  keyTakeaways: string[];
}

export interface TheoryMilestone {
  milestoneId: string;
  title: string;
  lessons: TheoryLesson[];
}

export interface TheoryData {
  course: string;
  milestones: TheoryMilestone[];
}

// Canonical map types
export interface CanonicalMapEntry {
  milestoneId: string;
  title: string;
  exerciseId: string;
  questionIds: number[];
}

export interface CanonicalMapData {
  description: string;
  order: string[];
  map: Record<string, CanonicalMapEntry>;
  milestoneToCriticalGate: Record<string, string[]>;
  notes: string[];
}

// Scoring result types
export interface ScoreResult {
  earned: number;
  max: number;
  percentage: number;
}

export type CompetencyResult = Record<string, number>;

export interface WeakArea {
  topic: string;
  questions: number[];
  recommendedExerciseId?: string;
}

export interface PlacementResult {
  score: ScoreResult;
  competencies: CompetencyResult;
  level: string;
  status: 'PASS' | 'FAIL';
  advancement: { canAdvance: boolean; nextMilestone?: string };
  weakAreas: WeakArea[];
  recommendedLessons: string[];
  studyPlan: string[];
  autoPassedExercises: string[];
  unlockedMilestones: string[];
  failReason?: string;
  studentAnswers?: Record<string, string>;
  skipToMilestoneId?: string;
}

// Path Builder types
export type LessonStatus = 'auto_passed' | 'required' | 'locked';

export interface LearningPathLesson {
  canonicalLessonId: string;
  stageId?: string;
  milestoneId: string;
  title: string;
  exerciseId: string;
  status: LessonStatus;
}

export interface PersonalizedPathResult {
  userId: string;
  placementSummary: {
    level: string;
    status: 'PASS' | 'FAIL';
    percentage: number;
  };
  learningPath: LearningPathLesson[];
  studyPlan: string[];
}

export interface EntranceTestResult {
  skipToMilestoneId: string;
  skillId: string;
  score: number;
  totalQuestions: number;
  placementResult?: PlacementResult;
  personalizedPath?: PersonalizedPathResult;
}
