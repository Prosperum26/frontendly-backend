import { Expose } from 'class-transformer';

import { User } from '@/users/schemas';
import { Badge } from '@/users/schemas/badge.schema';

export class MyProfileResponse {
  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Expose()
  stats: {
    totalLearningTime?: number;
    coursesCompleted?: number;
    streakDays?: number;
    lastActiveAt?: Date;
  };

  @Expose()
  social_accounts: Array<{
    provider: string;
    providerId: string;
    linkedAt: Date;
  }>;

  @Expose()
  skills: Array<{
    name: string;
    level: number;
    earnedAt: Date;
  }>;

  @Expose()
  badges: Array<{
    badgeId: Badge;
    earnedAt: Date;
  }>;

  @Expose()
  stage_progress: {
    currentStage?: number;
    maxUnlockedStage?: number;
    completedStages?: number[];
    totalProgress?: number;
    lastAccessedAt?: Date;
  };

  constructor(user: User) {
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.avatarUrl = user.avatarUrl;
    this.username = user.username;
    this.role = user.role;
    this.stats = user.stats;
    this.social_accounts = user.social_accounts;
    this.skills = user.skills;
    this.badges = user.badges as any;
    this.stage_progress = user.stage_progress;
  }
}
