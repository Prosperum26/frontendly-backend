import { AuthConfig } from '../auth.config';

export class ConfigMock {
  public static getAuthConfig(): AuthConfig {
    return {
      google: {
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
      },
      jwtSecret: 'jwt-secret',
    };
  }
}
