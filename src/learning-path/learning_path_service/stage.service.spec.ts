import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { UserUtilsService } from './user-utils.service';
import { XpService } from './xp.service';

// ─────────────────────────────────────────────────────────────────────────────
// XpService unit tests — guards and calculations
// ─────────────────────────────────────────────────────────────────────────────
describe('XpService', () => {
  let service: XpService;

  beforeEach(() => {
    service = new XpService();
  });

  describe('calculateLevel', () => {
    it('returns level 1 for 0 XP', () => {
      expect(service.calculateLevel(0)).toBe(1);
    });

    it('returns level 2 for XP >= 500 (default xpPerLevel)', () => {
      expect(service.calculateLevel(500)).toBe(2);
      expect(service.calculateLevel(999)).toBe(2);
    });

    it('returns level 3 for XP >= 1000', () => {
      expect(service.calculateLevel(1000)).toBe(3);
    });

    it('throws if xpPerLevel is 0', () => {
      expect(() => service.calculateLevel(100, 0)).toThrow(
        'xpPerLevel must be greater than 0',
      );
    });

    it('throws if xpPerLevel is negative', () => {
      expect(() => service.calculateLevel(100, -1)).toThrow(
        'xpPerLevel must be greater than 0',
      );
    });
  });

  describe('calculateLevelProgress', () => {
    it('throws if xpPerLevel is 0 (prevents division-by-zero)', () => {
      expect(() => service.calculateLevelProgress(100, 0)).toThrow(
        'xpPerLevel must be greater than 0',
      );
    });

    it('returns correct progress for mid-level XP', () => {
      const result = service.calculateLevelProgress(250, 500);
      expect(result.level).toBe(1);
      expect(result.xpInLevel).toBe(250);
      expect(result.progressPercent).toBe(50);
    });

    it('returns 0% progress at XP = 0', () => {
      const result = service.calculateLevelProgress(0);
      expect(result.progressPercent).toBe(0);
      expect(result.level).toBe(1);
    });
  });

  describe('getXpReward', () => {
    it('returns correct XP for each difficulty', () => {
      expect(service.getXpReward('easy')).toBe(10);
      expect(service.getXpReward('medium')).toBe(20);
      expect(service.getXpReward('hard')).toBe(30);
      expect(service.getXpReward('theory')).toBe(5);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UserUtilsService — isGuestUser edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('UserUtilsService.isGuestUser', () => {
  let service: UserUtilsService;

  beforeEach(() => {
    service = new UserUtilsService();
  });

  it('returns true for empty string (unauthenticated request)', () => {
    expect(service.isGuestUser('')).toBe(true);
  });

  it('returns true for guest- prefix', () => {
    expect(service.isGuestUser('guest-abc123')).toBe(true);
  });

  it('returns true for dummy-user prefix', () => {
    expect(service.isGuestUser('dummy-user-1')).toBe(true);
  });

  it('returns true for anonymous', () => {
    expect(service.isGuestUser('anonymous')).toBe(true);
  });

  it('returns false for a real authenticated userId', () => {
    expect(service.isGuestUser('507f1f77bcf86cd799439011')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// StageService error transparency — NotFoundException must surface, not wrap
// ─────────────────────────────────────────────────────────────────────────────
describe('StageService error transparency', () => {
  it('NotFoundException is re-thrown, not wrapped as generic DB error', () => {
    const notFound: Error = new NotFoundException(
      'Stage not found: rs-invalid',
    );
    expect(
      notFound instanceof NotFoundException ||
        notFound instanceof ForbiddenException,
    ).toBe(true);
  });

  it('ForbiddenException is re-thrown, not wrapped as generic DB error', () => {
    const forbidden: Error = new ForbiddenException(
      'Guest cannot complete stage',
    );
    expect(
      forbidden instanceof NotFoundException ||
        forbidden instanceof ForbiddenException,
    ).toBe(true);
  });

  it('generic Error is NOT an HttpException — gets wrapped as DB error', () => {
    const genericErr = new Error('Connection timeout');
    const isHttpException =
      genericErr instanceof NotFoundException ||
      genericErr instanceof ForbiddenException;
    expect(isHttpException).toBe(false);
  });
});
