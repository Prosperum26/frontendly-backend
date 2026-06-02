/* eslint-disable new-cap */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { User } from '../schemas';
import {
  CreateOrUpdateUserResult,
  CreateUserOptions,
  createUserSchema,
} from '../types';
import { UserLearningProgressDocument } from '@/learning-path/db_schemas/learning_path_schemas';
import { MilestoneDocument } from '@/learning-path/db_schemas/milestone_schema';

const XP_PER_LEVEL = 500;

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel('UserLearningProgress')
    private userProgressModel: Model<UserLearningProgressDocument>,
    @InjectModel('Milestone')
    private milestoneModel: Model<MilestoneDocument>,
  ) {}

  /**
   * Create a new user. If that user already exists, update the existing user
   * (uniqueness is determined by email).
   */
  public async createOrUpdateUser(
    options: CreateUserOptions,
  ): Promise<CreateOrUpdateUserResult> {
    await createUserSchema.parseAsync(options);
    const { email, googleId, firstName, lastName, picture } = options;
    // Update user information in case it doesn't already exist
    const update: UpdateQuery<User> = {
      googleId,
      firstName,
      lastName,
      avatarUrl: picture,
    };
    const res = await this.userModel.findOneAndUpdate({ email }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: false,
      includeResultMetadata: true,
      lean: true,
    });
    return {
      alreadyExists: res.lastErrorObject?.updatedExisting || false,
      user: res.value!,
    };
  }

  // ── GET /users/progress ────────────────────────────────────
  // Returns flat ProgressResponse shape the FE reads as `res.data`.
  // Falls back to zero state for new / unauthenticated users.
  async getProgress(userId: string): Promise<{
    level: number;
    xp: number;
    xpToNextLevel: number;
    progressPercent: number;
    streak: number;
    rank: string;
  }> {
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (dbProgress) {
        const totalXp = dbProgress.currentXp;
        const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
        const xpInLevel = totalXp % XP_PER_LEVEL;
        return {
          level,
          xp: xpInLevel,
          xpToNextLevel: XP_PER_LEVEL,
          progressPercent: Math.round((xpInLevel / XP_PER_LEVEL) * 100),
          streak: dbProgress.streakDays,
          rank: '-',
        };
      }
    } catch (err) {
      this.logger.warn(`getProgress DB error for ${userId}: ${String(err)}`);
    }

    return {
      level: 1,
      xp: 0,
      xpToNextLevel: XP_PER_LEVEL,
      progressPercent: 0,
      streak: 0,
      rank: '-',
    };
  }

  // ── GET /users/badges ──────────────────────────────────────
  // Returns { badges: Badge[] }. The FE reads `res.data.badges`.
  // Falls back to empty array for new / unauthenticated users.
  async getBadges(userId: string): Promise<{
    badges: Array<{
      id: string;
      name: string;
      icon: string;
      isUnlocked: boolean;
    }>;
  }> {
    try {
      const dbProgress = await this.userProgressModel
        .findOne({ userId })
        .lean();

      if (dbProgress && dbProgress.badges.length > 0) {
        const earnedIds = <string[]>dbProgress.badges;

        const milestones = await this.milestoneModel
          .find({ 'stages.id': { $in: earnedIds } })
          .lean();

        const stageInfo = new Map<string, { title: string; icon: string }>();
        for (const m of milestones) {
          for (const s of m.stages) {
            if (earnedIds.includes(s.id)) {
              stageInfo.set(s.id, {
                title: s.title,
                icon:
                  (<{ icon?: string }>s).icon ||
                  (<{ icon?: string }>m).icon ||
                  '',
              });
            }
          }
        }

        return {
          badges: earnedIds.map(id => ({
            id,
            name: stageInfo.get(id)?.title ?? id,
            icon: stageInfo.get(id)?.icon ?? '',
            isUnlocked: true,
          })),
        };
      }
    } catch (err) {
      this.logger.warn(`getBadges DB error for ${userId}: ${String(err)}`);
    }

    return { badges: [] };
  }
}
