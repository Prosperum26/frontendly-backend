import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import type { Response } from 'express';
import { Model, Types } from 'mongoose';

import { Token } from '../schemas';
import { Session } from '../schemas/session.schema';
import { DecodedJwt } from '../types';
import { AuthConfig, authConfigObj } from '@/common/config';
import { User } from '@/users/schemas';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @Inject(authConfigObj.KEY) private readonly authConfig: AuthConfig,
  ) { }

  public async signAccessToken(token: Token): Promise<string> {
    const jwt: DecodedJwt = {
      tokenId: token._id.toString(),
    };
    return this.jwtService.signAsync(jwt, {
      expiresIn: this.authConfig.accessTokenExpiresIn as any,
      secret: this.authConfig.jwtSecret,
    });
  }

  public async decodeAccessToken(token: string): Promise<DecodedJwt> {
    return this.jwtService.verifyAsync<DecodedJwt>(token, {
      secret: this.authConfig.jwtSecret,
    });
  }

  public async create(userId: Types.ObjectId): Promise<Token> {
    return this.tokenModel.create({ userId });
  }

  /**
   * Returns the token document if it exists and is valid. Otherwise, returns
   * `null`. Validity is defined as having `isActive` set to `true`, and current
   * date is less than `expiredAt`.
   */
  public async findUserByToken(tokenId: Types.ObjectId): Promise<User> {
    const token = await this.tokenModel
      .findById(tokenId)
      .populate<{ userId: User | null }>('userId')
      .lean();
    if (!token) {
      // It's best to throw 401 here, since most likely, the token is invalid
      // or manually deleted from the database.
      throw new UnauthorizedException('No matching token found');
    }
    if (!token.userId) {
      // This should never happen, so it's best to throw 500 here.
      throw new InternalServerErrorException(
        'Token exists, but no matching user found',
      );
    }
    return token.userId;
  }

  /**
   * Validate a token document
   */
  public async findAndValidateToken(
    tokenId: Types.ObjectId,
  ): Promise<Token | null> {
    const now = new Date();
    const token = await this.tokenModel.findById(tokenId).lean();
    if (!token) return null;
    if (!token.isActive || now >= token.expiredAt) return null;
    return token;
  }

  /**
   * Create a new session with refresh token
   */
  public async createSession(
    userId: Types.ObjectId,
    deviceInfo: string,
    days: number = 7,
  ): Promise<{ refreshToken: string; expiresAt: Date }> {
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = dayjs().add(days, 'day').toDate();

    await this.sessionModel.create({
      user_id: userId,
      refresh_token_hash: refreshTokenHash,
      device_info: deviceInfo,
      expires_at: expiresAt,
    });

    return { refreshToken, expiresAt };
  }

  /**
   * Refresh access token with token rotation
   * Invalidates old refresh token and issues new pair
   */
  public async refreshAccessToken(
    oldRefreshToken: string,
    res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshTokenHash = this.hashRefreshToken(oldRefreshToken);
      const session = await this.sessionModel.findOne({
        refresh_token_hash: refreshTokenHash,
      });

      if (!session) {
        this.logger.warn('Refresh token not found in database');
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      if (new Date() >= session.expires_at) {
        await this.sessionModel.deleteOne({ _id: session._id });
        this.logger.warn(`Expired refresh token attempted for user: ${session.user_id}`);
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Delete old session (token rotation)
      await this.sessionModel.deleteOne({ _id: session._id });

      // Create new access token
      const token = await this.create(session.user_id);
      const accessToken = await this.signAccessToken(token);

      // Create new session with new refresh token
      const { refreshToken, expiresAt } = await this.createSession(
        session.user_id,
        session.device_info,
        7, // Default 7 days for refresh token rotation
      );

      // Set new refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt,
      });

      this.logger.log(`Token refreshed successfully for user: ${session.user_id}`);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  /**
   * Revoke session (logout)
   */
  public async revokeSession(
    refreshToken: string,
    res: Response,
    userId?: Types.ObjectId,
  ): Promise<void> {
    try {
      const refreshTokenHash = this.hashRefreshToken(refreshToken);
      const session = await this.sessionModel.findOne({
        refresh_token_hash: refreshTokenHash,
      });

      if (session) {
        const sessionUserId = session.user_id;
        const result = await this.sessionModel.deleteOne({ refresh_token_hash: refreshTokenHash });

        if (result.deletedCount > 0) {
          this.logger.log(`Session revoked successfully for user: ${sessionUserId}`);
        }
      } else {
        this.logger.warn('Session not found for revocation (may already be revoked)');
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');
    } catch (error) {
      this.logger.error(`Session revocation failed: ${error.message}`);
      // Still clear cookie even if database operation fails
      res.clearCookie('refreshToken');
    }
  }

  /**
   * Revoke all sessions for a user (e.g., password change)
   */
  public async revokeAllUserSessions(userId: Types.ObjectId): Promise<void> {
    try {
      const result = await this.sessionModel.deleteMany({ user_id: userId });
      this.logger.log(`Revoked ${result.deletedCount} sessions for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke all sessions for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   */
  public async getUserSessions(
    userId: Types.ObjectId,
  ): Promise<Session[]> {
    try {
      const sessions = await this.sessionModel
        .find({ user_id: userId })
        .select('-refresh_token_hash')
        .lean();
      return sessions;
    } catch (error) {
      this.logger.error(`Failed to get sessions for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hash a refresh token using SHA-256 for secure storage
   */
  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a secure random refresh token
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
