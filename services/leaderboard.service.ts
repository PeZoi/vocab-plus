import { apiClient } from '@/lib/axios';

export interface LeaderboardUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  rank: number;
  is_qualified?: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  minThreshold?: number;
  userWeeklyXp?: number;
}

export const leaderboardService = {
  getLeaderboard: (timeframe: 'daily' | 'weekly' | 'all_time'): Promise<LeaderboardResponse> => {
    return apiClient.get('/leaderboard', { params: { timeframe } });
  }
};
