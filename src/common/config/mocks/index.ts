import { AuthConfig } from '../auth.config';

export class ConfigMock {
  public static getAuthConfig(): AuthConfig {
    return {
      google: {
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
      },
      jwtSecret: 'jwt-secret',
      frontendUrl: 'http://localhost:5173',
      accessTokenExpiresIn: '3h',
      passwordResetExpiresInMinutes: 15,
      bcryptSaltRounds: 10,
      rateLimitMaxAttempts: 5,
      rateLimitWindowMinutes: 15,
    };
  }
}
