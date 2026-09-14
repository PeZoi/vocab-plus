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

export interface TopPodiumItem {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  league: LeagueTier;
}

export interface LeagueSeason {
  id: string;
  season_number: number;
  title: string;
  start_date: string;
  end_date: string;
  reset_at: string;
  reset_by: string | null;
  total_participants: number;
  top_podium: TopPodiumItem[];
  created_at: string;
}

export interface SeasonUserHistory {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  rank_position: number;
  league_tier: LeagueTier;
  weekly_xp: number;
  zone: string | null;
  is_current_user?: boolean;
}

export interface SeasonDetailResponse {
  season: LeagueSeason;
  leaderboard: SeasonUserHistory[];
  currentUser: SeasonUserHistory | null;
}

export const leaderboardService = {
  getLeaderboard: (
    timeframe: 'daily' | 'weekly' | 'all_time',
    tier?: LeagueTier
  ): Promise<LeaderboardResponse> => {
    return apiClient.get('/leaderboard', { params: { timeframe, tier } });
  },

  getSeasons: (): Promise<LeagueSeason[]> => {
    return apiClient.get('/leaderboard/seasons');
  },

  getSeasonDetail: (seasonId: string): Promise<SeasonDetailResponse> => {
    return apiClient.get(`/leaderboard/seasons/${seasonId}`);
  },
};

