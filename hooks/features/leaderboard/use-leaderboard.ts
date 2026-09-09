import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';

export function useLeaderboardQuery(timeframe: 'daily' | 'weekly' | 'all_time') {
  return useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: () => leaderboardService.getLeaderboard(timeframe),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
