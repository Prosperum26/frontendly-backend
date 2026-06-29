import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { PathBuilderService } from './path-builder.service';
import { PlacementService } from './placement.service';
import { CanonicalMap } from '@/entrance-test/db_schemas/canonical-map.schema';
import { CourseTheory } from '@/entrance-test/db_schemas/course-theory.schema';
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
    lesson5: {
      exerciseId: 'ex5',
      questionIds: [9, 10],
      milestoneId: 'm1',
      title: 'Lesson 5',
    },
    lesson6: {
      exerciseId: 'ex6',
      questionIds: [11, 12],
      milestoneId: 'm2',
      title: 'Lesson 6',
    },
    lesson7: {
      exerciseId: 'ex7',
      questionIds: [13, 14],
      milestoneId: 'm3',
      title: 'Lesson 7',
    },
    lesson8: {
      exerciseId: 'ex8',
      questionIds: [15, 16],
      milestoneId: 'm3',
      title: 'Lesson 8',
    },
    lesson9: {
      exerciseId: 'ex9',
      questionIds: [17, 18],
      milestoneId: 'm1',
      title: 'Lesson 9',
    },
    lesson10: {
      exerciseId: 'ex10',
      questionIds: [19, 20],
      milestoneId: 'm2',
      title: 'Lesson 10',
    },
    lesson11: {
      exerciseId: 'ex11',
      questionIds: [1, 2],
      milestoneId: 'm1',
      title: 'Lesson 11',
    },
    lesson12: {
      exerciseId: 'ex12',
      questionIds: [3, 4],
      milestoneId: 'm1',
      title: 'Lesson 12',
    },
  },
  order: [
    'lesson1',
    'lesson2',
    'lesson3',
    'lesson4',
    'lesson5',
    'lesson6',
    'lesson7',
    'lesson8',
    'lesson9',
    'lesson10',
    'lesson11',
    'lesson12',
  ],
  milestoneToCriticalGate: {
    m1: ['gate1'],
    m2: [],
    m3: [],
  },
};

const mockCourseTheoryData = {
  milestones: [
    {
      milestoneId: 'm1',
      lessons: [
        { lessonId: 'lesson1', title: 'Lesson 1' },
        { lessonId: 'lesson2', title: 'Lesson 2' },
        { lessonId: 'lesson5', title: 'Lesson 5' },
        { lessonId: 'lesson9', title: 'Lesson 9' },
        { lessonId: 'lesson11', title: 'Lesson 11' },
        { lessonId: 'lesson12', title: 'Lesson 12' },
      ],
    },
    {
      milestoneId: 'm2',
      lessons: [
        { lessonId: 'lesson3', title: 'Lesson 3' },
        { lessonId: 'lesson6', title: 'Lesson 6' },
        { lessonId: 'lesson10', title: 'Lesson 10' },
      ],
    },
    {
      milestoneId: 'm3',
      lessons: [
        { lessonId: 'lesson4', title: 'Lesson 4' },
        { lessonId: 'lesson7', title: 'Lesson 7' },
        { lessonId: 'lesson8', title: 'Lesson 8' },
      ],
    },
  ],
};

describe('PathBuilderService', () => {
  let service: PathBuilderService;
  let placementService: PlacementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PathBuilderService,
        PlacementService,
        {
          provide: getModelToken(CanonicalMap.name),
          useValue: {
            findOne: () => ({
              lean: () => ({ exec: () => mockCanonicalMapData }),
            }),
          },
        },
        {
          provide: getModelToken(CourseTheory.name),
          useValue: {
            findOne: () => ({
              lean: () => ({ exec: () => mockCourseTheoryData }),
            }),
          },
        },
        {
          provide: getModelToken(EntranceTest.name),
          useValue: {
            findOne: () => ({
              lean: () => ({ exec: () => mockEntranceTestData }),
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

    service = module.get<PathBuilderService>(PathBuilderService);
    placementService = module.get<PlacementService>(PlacementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build a personalized path with auto-passed lessons when all answers are correct', async () => {
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
    const placementResult =
      await placementService.processPlacement(allCorrectAnswers);
    const pathResult = await service.buildPersonalizedPath(
      'test-user-123',
      placementResult,
    );

    expect(pathResult.learningPath).toHaveLength(12);
    expect(pathResult.placementSummary.status).toBe('PASS');
  });

  it('should have some required lessons when some answers are wrong', async () => {
    const partialAnswers = {
      '1': 'C',
      '2': 'B',
      '3': 'D',
      '4': 'B',
      '5': 'C',
      '6': 'B',
      '7': 'A',
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
    const placementResult =
      await placementService.processPlacement(partialAnswers);
    const pathResult = await service.buildPersonalizedPath(
      'test-user-456',
      placementResult,
    );
    const hasRequiredLessons = pathResult.learningPath.some(
      (lesson: { status: string }) => lesson.status === 'required',
    );
    expect(hasRequiredLessons).toBe(true);
  });
});
