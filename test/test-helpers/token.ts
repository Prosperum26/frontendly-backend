import { TestingModule } from '@nestjs/testing';

import { Token } from '@/auth/schemas';
import { TokenService } from '@/auth/services';

/**
 * Helper function that generates an access token to prepare for testing.
 */
export async function signAccessToken(
  mod: TestingModule,
  token: Token,
): Promise<string> {
  const tokenService = mod.get(TokenService);
  return tokenService.signAccessToken(token);
}
