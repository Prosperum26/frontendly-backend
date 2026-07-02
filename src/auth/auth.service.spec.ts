import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { TokenService } from './services';
import { authConfigObj } from '@/common/config';
import { EmailService } from '@/common/email/email.service';
import { User } from '@/users/schemas';
import { GamificationService } from '@/users/services/gamification.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: GamificationService,
          useValue: {},
        },
        {
          provide: authConfigObj.KEY,
          useValue: { bcryptSaltRounds: 10, passwordResetExpiresInMinutes: 15 },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
