'use client';

import { useQuery } from '@tanstack/react-query';
import { telegramKeys } from '@/constants/query-keys';
import { telegramService } from '@/services/telegram.service';
import type { TelegramNotificationLog } from '@/types/telegram.types';

interface UseTelegramHistoryOptions {
  limit?: number;
  enabled?: boolean;
}

export function useTelegramHistory(options: UseTelegramHistoryOptions = {}) {
  const { limit = 5, enabled = true } = options;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: telegramKeys.history(limit),
    queryFn: async () => {
      const res = await telegramService.getNotificationHistory(limit);
      return res.data;
    },
    enabled,
    staleTime: 1000 * 30, // 30s
  });

  return {
    logs: (data as TelegramNotificationLog[]) || [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}
