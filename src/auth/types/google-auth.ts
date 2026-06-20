import { User } from '@/users/schemas';

type DailyCheckInResult = {
  checkedIn: boolean;
  xpEarned: number;
  currentStreak: number;
};

export type GoogleAuthResult = {
  user: User;
  accessToken: string;
  refreshToken?: string;
  isNewUser: boolean;
  dailyCheckIn?: DailyCheckInResult;
};
