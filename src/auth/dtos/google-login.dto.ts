import { Expose } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class GoogleLoginRequestDto {
  @IsString()
  idToken: string;

  @IsString()
  @IsOptional()
  redirectUrl?: string;
}

type DailyCheckInResult = {
  checkedIn: boolean;
  xpEarned: number;
  currentStreak: number;
};

export class GoogleLoginResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  user: any;

  @Expose()
  isNewUser: boolean;

  @Expose()
  dailyCheckIn?: DailyCheckInResult;

  constructor(
    accessToken: string,
    user: any,
    refreshToken?: string,
    isNewUser: boolean = false,
    dailyCheckIn?: DailyCheckInResult,
  ) {
    this.accessToken = accessToken;
    this.user = user;
    this.refreshToken = refreshToken;
    this.isNewUser = isNewUser;
    this.dailyCheckIn = dailyCheckIn;
  }
}
