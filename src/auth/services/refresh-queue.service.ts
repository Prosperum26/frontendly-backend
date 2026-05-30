import { Injectable } from '@nestjs/common';

/**
 * Service to handle race conditions during token refresh.
 * Uses a simple in-memory Map to track ongoing refresh operations per user.
 */
@Injectable()
export class RefreshQueueService {
  private readonly refreshLocks = new Map<string, Promise<any>>();

  /**
   * Execute a refresh operation with mutex lock per user.
   * If a refresh is already in progress for the same user, wait for it to complete.
   */
  async executeWithLock<T>(
    userId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const existingLock = this.refreshLocks.get(userId);

    if (existingLock) {
      // Wait for the existing operation to complete
      return existingLock;
    }

    // Create a new lock
    const lock = operation()
      .finally(() => {
        // Remove the lock after operation completes
        this.refreshLocks.delete(userId);
      });

    this.refreshLocks.set(userId, lock);
    return lock;
  }
}
