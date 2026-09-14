import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import { leaderboardKeys } from '@/constants/query-keys';

/**
 * Hook lấy danh sách các mùa giải đã lưu trữ
 */
export function useSeasonsQuery() {
  return useQuery({
    queryKey: leaderboardKeys.seasons(),
    queryFn: () => leaderboardService.getSeasons(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook lấy chi tiết bảng xếp hạng của một mùa giải cụ thể
 */
export function useSeasonDetailQuery(seasonId: string | null | undefined) {
  return useQuery({
    queryKey: seasonId ? leaderboardKeys.seasonDetail(seasonId) : ['leaderboard', 'season', 'none'],
    queryFn: () => {
      if (!seasonId) throw new Error('Cần cung cấp seasonId');
      return leaderboardService.getSeasonDetail(seasonId);
    },
    enabled: Boolean(seasonId),
    staleTime: 1000 * 60 * 10, // 10 minutes (mùa giải đã đóng không đổi số liệu)
  });
}
