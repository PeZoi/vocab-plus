import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import type { LeagueTier } from '@/constants/leagues';

export function useLeaderboardQuery(
  timeframe: 'daily' | 'weekly' | 'all_time',
  tier?: LeagueTier
) {
  return useQuery({
    queryKey: ['leaderboard', timeframe, tier],
    queryFn: () => leaderboardService.getLeaderboard(timeframe, tier),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
