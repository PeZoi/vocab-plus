import { apiClient } from '@/lib/axios';
import type { DailyQuestsResponse } from '@/types/quest.types';

export const questsService = {
  getDailyQuests: (): Promise<DailyQuestsResponse> => {
    return apiClient.get('/quests/daily');
  },
};
