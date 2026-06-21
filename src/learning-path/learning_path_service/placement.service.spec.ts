import { Test, TestingModule } from '@nestjs/testing';

import { PlacementService } from './placement.service';

describe('PlacementService', () => {
  let service: PlacementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlacementService],
    }).compile();

    service = module.get<PlacementService>(PlacementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate correct score when all answers are correct', () => {
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
    const result = service.calculateScore(allCorrectAnswers);
    expect(result.scoreResult.percentage).toBe(100);
    expect(result.competencies.foundation).toBe(100);
    expect(result.competencies.styling).toBe(100);
    expect(result.competencies.component).toBe(100);
    expect(result.competencies.state).toBe(100);
  });

  it('should check critical gates and fail when state competency is too low', () => {
    const competencies = {
      foundation: 80,
      styling: 70,
      component: 70,
      state: 40,
    };
    const gateCheck = service.checkCriticalGates(competencies);
    expect(gateCheck.status).toBe('FAIL');
    expect(gateCheck.failReason).toContain('State');
  });

  it('should pass critical gates when all meet thresholds', () => {
    const competencies = {
      foundation: 80,
      styling: 70,
      component: 70,
      state: 60,
    };
    const gateCheck = service.checkCriticalGates(competencies);
    expect(gateCheck.status).toBe('PASS');
  });
});
