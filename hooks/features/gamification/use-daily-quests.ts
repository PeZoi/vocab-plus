import { useQuery } from '@tanstack/react-query';
import { questsService } from '@/services/quests.service';
import { questKeys } from '@/constants/query-keys';
import type { DailyQuestsResponse } from '@/types/quest.types';

export function useDailyQuestsQuery() {
  return useQuery<DailyQuestsResponse>({
    queryKey: questKeys.daily(),
    queryFn: () => questsService.getDailyQuests(),
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}
