import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ProgressSummaryService } from './progress-summary.service';
import { ProgressService } from './progress.service';

const mockProgressService = {
  computeProgress: jest.fn().mockReturnValue({
    courseProgressPercentage: 0,
    milestoneProgress: {},
  }),
};

const buildModule = async (
  userProgressValue: unknown,
  roadmapValue: unknown,
  milestonesValue: unknown[],
) => {
  const mockUserProgress = {
    findOne: jest.fn().mockReturnValue({
      lean: async () => Promise.resolve(userProgressValue),
    }),
  };
  const mockRoadmap = {
    findOne: jest
      .fn()
      .mockReturnValue({ lean: async () => Promise.resolve(roadmapValue) }),
  };
  const mockMilestone = {
    find: jest
      .fn()
      .mockReturnValue({ lean: async () => Promise.resolve(milestonesValue) }),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ProgressSummaryService,
      { provide: getModelToken('Milestone'), useValue: mockMilestone },
      { provide: getModelToken('Roadmap'), useValue: mockRoadmap },
      {
        provide: getModelToken('UserLearningProgress'),
        useValue: mockUserProgress,
      },
      { provide: ProgressService, useValue: mockProgressService },
    ],
  }).compile();

  return module.get<ProgressSummaryService>(ProgressSummaryService);
};

describe('ProgressSummaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProgressService.computeProgress.mockReturnValue({
      courseProgressPercentage: 0,
      milestoneProgress: {},
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Scenario A — New User (0% progress, no DB record)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Scenario A: New User', () => {
    it('returns safe zero-defaults when no UserLearningProgress exists', async () => {
      const service = await buildModule(null, null, []);

      const result = await service.getProgressSummary('user-new', 'react');

      expect(result).toMatchObject({
        userId: 'user-new',
        currentXp: 0,
        streakDays: 0,
        earnedBadges: [],
        completedMilestonesDetail: [],
        courseProgressPercentage: 0,
        totalStages: 0,
        completedStages: 0,
        milestoneProgress: {},
        unlockedStages: [],
      });
    });

    it('does NOT throw when dbProgress is null', async () => {
      const service = await buildModule(null, null, []);
      await expect(
        service.getProgressSummary('user-new', 'react'),
      ).resolves.not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Scenario B — In-Progress User (Milestone 1 complete, Milestone 2+ not started)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Scenario B: In-Progress User', () => {
    const dbProgress = {
      userId: 'user-mid',
      skillId: 'react',
      currentXp: 40,
      streakDays: 3,
      earnedBadges: [
        {
          badgeId: 'badge-rm1',
          name: 'React Pioneer',
          icon: '🌱',
          earnedAt: new Date(),
        },
      ],
      completedMilestones: [
        {
          milestoneId: 'rm1',
          completedAt: new Date('2025-01-10'),
          badgeId: 'badge-rm1',
        },
      ],
      totalCompletedStages: 4,
      lastActiveStageId: 'rs4',
      lastActiveMilestoneId: 'rm1',
      unlockedStages: [
        {
          stageId: 'rs1',
          earnedStars: 3,
          theoryCompleted: true,
          isPracticeUnlocked: true,
          videoWatchPercentage: 100,
        },
        {
          stageId: 'rs2',
          earnedStars: 3,
          theoryCompleted: true,
          isPracticeUnlocked: true,
          videoWatchPercentage: 100,
        },
        {
          stageId: 'rs3',
          earnedStars: 3,
          theoryCompleted: true,
          isPracticeUnlocked: true,
          videoWatchPercentage: 100,
        },
        {
          stageId: 'rs4',
          earnedStars: 3,
          theoryCompleted: true,
          isPracticeUnlocked: true,
          videoWatchPercentage: 100,
        },
      ],
    };

    const dbRoadmap = { skillId: 'react', milestoneIds: ['rm1', 'rm2', 'rm3'] };

    const dbMilestones = [
      {
        id: 'rm1',
        title: 'React Foundations',
        stages: [{ id: 'rs1' }, { id: 'rs2' }, { id: 'rs3' }, { id: 'rs4' }],
      },
      {
        id: 'rm2',
        title: 'Components & Props',
        stages: [{ id: 'rs5' }, { id: 'rs6' }, { id: 'rs7' }, { id: 'rs8' }],
      },
      {
        id: 'rm3',
        title: 'Hooks & Advanced Patterns',
        stages: [{ id: 'rs9' }, { id: 'rs10' }, { id: 'rs11' }, { id: 'rs12' }],
      },
    ];

    beforeEach(() => {
      mockProgressService.computeProgress.mockReturnValue({
        courseProgressPercentage: 33,
        milestoneProgress: { rm1: 100, rm2: 0, rm3: 0 },
      });
    });

    it('returns 1 completed milestone with badge info', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-mid', 'react')
      );

      const detail = <
        Array<{
          milestoneId: string;
          title: string;
          badge: unknown;
        }>
      >result.completedMilestonesDetail;
      expect(detail).toHaveLength(1);
      expect(detail[0].milestoneId).toBe('rm1');
      expect(detail[0].title).toBe('React Foundations');
      expect(detail[0].badge).toMatchObject({
        name: 'React Pioneer',
        icon: '🌱',
      });
    });

    it('returns 1 earned badge', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-mid', 'react')
      );

      const badges = <unknown[]>result.earnedBadges;
      expect(badges).toHaveLength(1);
    });

    it('returns correct XP and streak', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-mid', 'react')
      );

      expect(result.currentXp).toBe(40);
      expect(result.streakDays).toBe(3);
    });

    it('counts completedStages as stages with earnedStars >= 3', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-mid', 'react')
      );

      expect(result.completedStages).toBe(4);
      expect(result.totalStages).toBe(12);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Scenario C — Completed User (All 3 milestones done, all badges awarded)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Scenario C: Completed User', () => {
    const buildStages = (ids: string[]) =>
      ids.map(id => ({
        stageId: id,
        earnedStars: 3,
        theoryCompleted: true,
        isPracticeUnlocked: true,
        videoWatchPercentage: 100,
      }));

    const dbProgress = {
      userId: 'user-done',
      skillId: 'react',
      currentXp: 360,
      streakDays: 12,
      earnedBadges: [
        {
          badgeId: 'badge-rm1',
          name: 'React Pioneer',
          icon: '🌱',
          earnedAt: new Date(),
        },
        {
          badgeId: 'badge-rm2',
          name: 'Component Architect',
          icon: '🧩',
          earnedAt: new Date(),
        },
        {
          badgeId: 'badge-rm3',
          name: 'Hooks Wizard',
          icon: '🪝',
          earnedAt: new Date(),
        },
      ],
      completedMilestones: [
        { milestoneId: 'rm1', completedAt: new Date(), badgeId: 'badge-rm1' },
        { milestoneId: 'rm2', completedAt: new Date(), badgeId: 'badge-rm2' },
        { milestoneId: 'rm3', completedAt: new Date(), badgeId: 'badge-rm3' },
      ],
      totalCompletedStages: 12,
      lastActiveStageId: 'rs12',
      lastActiveMilestoneId: 'rm3',
      unlockedStages: buildStages([
        'rs1',
        'rs2',
        'rs3',
        'rs4',
        'rs5',
        'rs6',
        'rs7',
        'rs8',
        'rs9',
        'rs10',
        'rs11',
        'rs12',
      ]),
    };

    const dbRoadmap = { skillId: 'react', milestoneIds: ['rm1', 'rm2', 'rm3'] };

    const dbMilestones = [
      {
        id: 'rm1',
        title: 'React Foundations',
        stages: [{ id: 'rs1' }, { id: 'rs2' }, { id: 'rs3' }, { id: 'rs4' }],
      },
      {
        id: 'rm2',
        title: 'Components & Props',
        stages: [{ id: 'rs5' }, { id: 'rs6' }, { id: 'rs7' }, { id: 'rs8' }],
      },
      {
        id: 'rm3',
        title: 'Hooks & Advanced Patterns',
        stages: [{ id: 'rs9' }, { id: 'rs10' }, { id: 'rs11' }, { id: 'rs12' }],
      },
    ];

    beforeEach(() => {
      mockProgressService.computeProgress.mockReturnValue({
        courseProgressPercentage: 100,
        milestoneProgress: { rm1: 100, rm2: 100, rm3: 100 },
      });
    });

    it('returns 3 completed milestones each with their badge', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-done', 'react')
      );

      const detail = <
        Array<{
          milestoneId: string;
          badge: { icon: string };
        }>
      >result.completedMilestonesDetail;
      expect(detail).toHaveLength(3);
      expect(detail[0].badge.icon).toBe('🌱');
      expect(detail[1].badge.icon).toBe('🧩');
      expect(detail[2].badge.icon).toBe('🪝');
    });

    it('returns 3 earned badges', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-done', 'react')
      );

      expect(<unknown[]>result.earnedBadges).toHaveLength(3);
    });

    it('reports 100% course progress', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-done', 'react')
      );

      expect(result.courseProgressPercentage).toBe(100);
    });

    it('reports all 12 stages completed', async () => {
      const service = await buildModule(dbProgress, dbRoadmap, dbMilestones);
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-done', 'react')
      );

      expect(result.completedStages).toBe(12);
      expect(result.totalStages).toBe(12);
    });

    it('completedMilestone with null badgeId returns null badge', async () => {
      const progressNoBadge = {
        ...dbProgress,
        completedMilestones: [
          { milestoneId: 'rm1', completedAt: new Date(), badgeId: '' },
        ],
        earnedBadges: [],
      };
      const service = await buildModule(
        progressNoBadge,
        dbRoadmap,
        dbMilestones,
      );
      const result = <Record<string, unknown>>(
        await service.getProgressSummary('user-done', 'react')
      );

      const detail = <
        Array<{
          badge: unknown;
        }>
      >result.completedMilestonesDetail;
      expect(detail[0].badge).toBeNull();
    });
  });
});
