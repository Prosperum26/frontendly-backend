import { Expose } from 'class-transformer';

import { User } from '@/users/schemas';
import { Badge } from '@/users/schemas/badge.schema';

export class MyProfileResponse {
  @Expose()
  _id!: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  name: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  username: string;

  // THÊM: Expose 3 trường mới
  @Expose()
  phoneNumber?: string;

  @Expose()
  dateOfBirth?: string;

  @Expose()
  bio?: string;

  @Expose()
  role: string;

  @Expose()
  xp: number;

  @Expose()
  level: number;

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
    this.firstName = user.firstName ?? '';
    this.lastName = user.lastName ?? '';
    this.name = user.name ?? '';
    this.avatarUrl = user.avatarUrl ?? '';
    this.username = user.username;

    // THÊM: Gán giá trị từ model vào response
    this.phoneNumber = user.phoneNumber ?? '';
    this.dateOfBirth = user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split('T')[0]
      : '';
    this.bio = user.bio ?? '';

    this.role = user.role ?? 'user';
    this.xp = user.xp ?? 0;
    this.level = user.level ?? 1;
    this.stats = user.stats ?? {};
    this.social_accounts = user.social_accounts ?? [];
    this.skills = user.skills ?? [];
    this.badges = <any>(user.badges ?? []);
    this.stage_progress = user.stage_progress ?? {};
  }
}
