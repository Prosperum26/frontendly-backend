import { Test, TestingModule } from '@nestjs/testing';

import { PathBuilderService } from './path-builder.service';
import { PlacementService } from './placement.service';

describe('PathBuilderService', () => {
  let service: PathBuilderService;
  let placementService: PlacementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PathBuilderService, PlacementService],
    }).compile();

    service = module.get<PathBuilderService>(PathBuilderService);
    placementService = module.get<PlacementService>(PlacementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build a personalized path with auto-passed lessons when all answers are correct', () => {
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
      placementService.processPlacement(allCorrectAnswers);
    const pathResult = service.buildPersonalizedPath(
      'test-user-123',
      placementResult,
    );

    expect(pathResult.learningPath).toHaveLength(12);
    expect(pathResult.placementSummary.status).toBe('PASS');
  });

  it('should have some required lessons when some answers are wrong', () => {
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
    const placementResult = placementService.processPlacement(partialAnswers);
    const pathResult = service.buildPersonalizedPath(
      'test-user-456',
      placementResult,
    );
    const hasRequiredLessons = pathResult.learningPath.some(
      lesson => lesson.status === 'required',
    );
    expect(hasRequiredLessons).toBe(true);
  });
});
