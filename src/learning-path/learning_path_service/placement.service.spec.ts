import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { PlacementService } from './placement.service';
import { CanonicalMap } from '@/entrance-test/db_schemas/canonical-map.schema';
import { EntranceTest } from '@/entrance-test/db_schemas/entrance-test.schema';
import { GamificationService } from '@/users/services/gamification.service';

const mockEntranceTestData = {
  questions: [
    { id: 1, correctAnswer: 'C', topic: 'Foundation' },
    { id: 2, correctAnswer: 'B', topic: 'Foundation' },
    { id: 3, correctAnswer: 'D', topic: 'Styling' },
    { id: 4, correctAnswer: 'B', topic: 'Styling' },
    { id: 5, correctAnswer: 'C', topic: 'Component' },
    { id: 6, correctAnswer: 'B', topic: 'Component' },
    { id: 7, correctAnswer: 'C', topic: 'State' },
    { id: 8, correctAnswer: 'C', topic: 'State' },
    { id: 9, correctAnswer: 'A', topic: 'Foundation' },
    { id: 10, correctAnswer: 'A', topic: 'Foundation' },
    { id: 11, correctAnswer: 'C', topic: 'Styling' },
    { id: 12, correctAnswer: 'B', topic: 'Styling' },
    { id: 13, correctAnswer: 'C', topic: 'Component' },
    { id: 14, correctAnswer: 'B', topic: 'Component' },
    { id: 15, correctAnswer: 'C', topic: 'State' },
    { id: 16, correctAnswer: 'C', topic: 'State' },
    { id: 17, correctAnswer: 'B', topic: 'Foundation' },
    { id: 18, correctAnswer: 'D', topic: 'Foundation' },
    { id: 19, correctAnswer: 'D', topic: 'Styling' },
    { id: 20, correctAnswer: 'B', topic: 'Styling' },
  ],
  difficultyWeight: {
    easy: { weight: 1, questions: [1, 2, 9, 10, 17, 18] },
    medium: { weight: 2, questions: [3, 4, 11, 12, 19, 20] },
    hard: { weight: 3, questions: [5, 6, 13, 14, 15, 16, 7, 8] },
  },
  questionMapping: {
    foundation: [1, 2, 9, 10, 17, 18],
    styling: [3, 4, 11, 12, 19, 20],
    component: [5, 6, 13, 14],
    state: [7, 8, 15, 16],
  },
  criticalGateRules: [
    {
      id: 'gate1',
      competency: 'state',
      minPercentage: 50,
      failReason: 'State competency too low',
    },
  ],
  advancementLevels: [
    { min: 0, max: 49, label: 'Beginner', action: 'Start at Milestone 1' },
    { min: 50, max: 79, label: 'Intermediate', action: 'Milestone 2' },
    { min: 80, max: 100, label: 'Advanced', action: 'Milestone 3' },
  ],
};

const mockCanonicalMapData = {
  map: {
    lesson1: {
      exerciseId: 'ex1',
      questionIds: [1, 2],
      milestoneId: 'm1',
      title: 'Lesson 1',
    },
    lesson2: {
      exerciseId: 'ex2',
      questionIds: [3, 4],
      milestoneId: 'm1',
      title: 'Lesson 2',
    },
    lesson3: {
      exerciseId: 'ex3',
      questionIds: [5, 6],
      milestoneId: 'm2',
      title: 'Lesson 3',
    },
    lesson4: {
      exerciseId: 'ex4',
      questionIds: [7, 8],
      milestoneId: 'm3',
      title: 'Lesson 4',
    },
  },
  order: ['lesson1', 'lesson2', 'lesson3', 'lesson4'],
  milestoneToCriticalGate: {
    m1: ['gate1'],
    m2: [],
    m3: [],
  },
};

describe('PlacementService', () => {
  let service: PlacementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacementService,
        {
          provide: getModelToken(EntranceTest.name),
          useValue: {
            findOne: () => ({
              lean: () => ({ exec: () => mockEntranceTestData }),
            }),
          },
        },
        {
          provide: getModelToken(CanonicalMap.name),
          useValue: {
            findOne: () => ({
              lean: () => ({ exec: () => mockCanonicalMapData }),
            }),
          },
        },
        {
          provide: getModelToken('UserLearningProgress'),
          useValue: {},
        },
        {
          provide: GamificationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PlacementService>(PlacementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate correct score when all answers are correct', async () => {
    const allCorrectAnswers = {
      '1': 'C',
      '2': 'B',
      '3': 'D',
      '4': 'B',
      '5': 'C',
      '6': 'B',
      '7': 'C',
      '8': 'C',
      '9': 'A',
      '10': 'A',
      '11': 'C',
      '12': 'B',
      '13': 'C',
      '14': 'B',
      '15': 'C',
      '16': 'C',
      '17': 'B',
      '18': 'D',
      '19': 'D',
      '20': 'B',
    };
    const result = await service.calculateScore(allCorrectAnswers);
    expect(result.scoreResult.percentage).toBe(100);
    expect(result.competencies.foundation).toBe(100);
    expect(result.competencies.styling).toBe(100);
    expect(result.competencies.component).toBe(100);
    expect(result.competencies.state).toBe(100);
  });

  it('should check critical gates and fail when state competency is too low', async () => {
    const competencies = {
      foundation: 80,
      styling: 70,
      component: 70,
      state: 40,
    };
    const gateCheck = await service.checkCriticalGates(competencies);
    expect(gateCheck.status).toBe('FAIL');
    expect(gateCheck.failReason).toContain('State');
  });

  it('should pass critical gates when all meet thresholds', async () => {
    const competencies = {
      foundation: 80,
      styling: 70,
      component: 70,
      state: 60,
    };
    const gateCheck = await service.checkCriticalGates(competencies);
    expect(gateCheck.status).toBe('PASS');
  });
});
