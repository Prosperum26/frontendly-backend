import { Injectable, Logger } from '@nestjs/common';

import { XP_REWARDS } from '../seedFiles/data';
import { XPRewards } from '../types/learning-path.types';

@Injectable()
export class XPService {
  private readonly logger: Logger = new Logger(XPService.name);

  /**
   * Calculate XP reward based on exercise level
   */
  getXPReward(level: 'easy' | 'medium' | 'hard'): number {
    return XP_REWARDS[level] || 0;
  }

  /**
   * Get XP reward for watching video intro
   */
  getVideoIntroReward(): number {
    return XP_REWARDS.videoIntro;
  }

  /**
   * Calculate total level from XP
   */
  calculateLevel(totalXp: number, xpPerLevel: number = 500): number {
    return Math.floor(totalXp / xpPerLevel) + 1;
  }

  /**
   * Calculate XP progress within current level
   */
  calculateLevelProgress(
    totalXp: number,
    xpPerLevel: number = 500,
  ): {
    level: number;
    xpInLevel: number;
    progressPercent: number;
  } {
    const level = this.calculateLevel(totalXp, xpPerLevel);
    const xpInLevel = totalXp % xpPerLevel;
    const progressPercent = Math.round((xpInLevel / xpPerLevel) * 100);

    return { level, xpInLevel, progressPercent };
  }

  /**
   * Validate XP reward configuration
   */
  validateXPRewards(): boolean {
    const rewards: XPRewards = XP_REWARDS;
    return (
      rewards.easy > 0 &&
      rewards.medium > rewards.easy &&
      rewards.hard > rewards.medium &&
      rewards.videoIntro > 0
    );
  }
}
