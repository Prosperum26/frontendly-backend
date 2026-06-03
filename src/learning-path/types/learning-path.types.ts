export interface Roadmap {
  skillId: string;
  skillTitle: string;
  milestoneIds: string[];
}

export interface Stage {
  id: string;
  title: string;
  isCompleted: boolean;
  earnedStars: number;
  icon?: string;
}

export interface Milestone {
  id: string;
  title: string;
  icon: string;
  status: 'completed' | 'in_progress' | 'locked';
  stages: Stage[];
}

export interface Theory {
  stageId: string;
  title: string;
  videoUrl: string;
  contentHtml: string;
  proTips: string;
  referenceLinks: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export interface Exercise {
  id: string;
  level: 'easy' | 'medium' | 'hard';
  title: string;
  instruction: string;
  boilerplateCode: {
    html: string;
    js: string;
  };
}

export interface Practice {
  stageId: string;
  exercises: Exercise[];
}

export interface UserProgress {
  stages: Record<string, {
    isPracticeUnlocked: boolean;
    earnedStars: number;
    isCompleted: boolean;
    theoryRead: boolean;
    videoWatchPercentage: number;
  }>;
  currentXp: number;
  streakDays: number;
  lastStreakDate: string | null;
  badges: string[];
}

export interface XPRewards {
  easy: number;
  medium: number;
  hard: number;
  videoIntro: number;
}
