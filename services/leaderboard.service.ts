import { apiClient } from '@/lib/axios';
import type { LeagueTier, ZoneType } from '@/constants/leagues';

export interface LeaderboardUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  rank: number;
  is_qualified?: boolean;
  zone?: ZoneType;
  league?: LeagueTier;
}

export interface TierConfigItem {
  promoteXp: number;
  stayXp: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  currentTier?: LeagueTier;
  promoteThreshold?: number;
  stayThreshold?: number;
  userWeeklyXp?: number;
  tierConfigs?: Record<LeagueTier, TierConfigItem>;
}

export const leaderboardService = {
  getLeaderboard: (
    timeframe: 'daily' | 'weekly' | 'all_time',
    tier?: LeagueTier
  ): Promise<LeaderboardResponse> => {
    return apiClient.get('/leaderboard', { params: { timeframe, tier } });
  },
};
