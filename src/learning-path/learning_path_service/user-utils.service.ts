import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserUtilsService {
  private readonly logger: Logger = new Logger(UserUtilsService.name);

  isGuestUser(userId: string): boolean {
    return (
      userId === 'guest' ||
      userId.startsWith('guest-') ||
      userId.startsWith('dummy-user') ||
      userId === 'anonymous'
    );
  }

  /**
   * Check if user is authenticated (not a guest)
   */
  isAuthUser(userId: string): boolean {
    return !this.isGuestUser(userId);
  }

  /**
   * Get a valid user ID for database operations
   * For guests, return null to prevent saving progress
   */
  getUserIdForDb(userId: string): string | null {
    if (this.isGuestUser(userId)) {
      this.logger.debug(
        `Guest user detected, skipping progress save: ${userId}`,
      );
      return null;
    }
    return userId;
  }
}
