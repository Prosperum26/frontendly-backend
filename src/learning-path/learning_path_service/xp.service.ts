import { Injectable, Logger } from '@nestjs/common';

import { XpRewards } from '../types/learning-path.types';

export const XP_REWARDS: XpRewards = {
  easy: 10,
  medium: 20,
  hard: 30,
  theory: 5,
  videoIntro: 15,
};

@Injectable()
export class XpService {
  private readonly logger: Logger = new Logger(XpService.name);

  /**
   * Calculate XP reward based on exercise level or content type
   */
  getXpReward(level: 'easy' | 'medium' | 'hard' | 'theory'): number {
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
  validateXpRewards(): boolean {
    const rewards: XpRewards = XP_REWARDS;
    return (
      rewards.easy > 0 &&
      rewards.medium > rewards.easy &&
      rewards.hard > rewards.medium &&
      rewards.videoIntro > 0
    );
  }
}
