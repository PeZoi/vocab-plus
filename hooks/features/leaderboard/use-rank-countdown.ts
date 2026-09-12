'use client';

import { useState, useEffect } from 'react';
import { getRankResetCountdown, type RankResetCountdown } from '@/utils/datetime';

/**
 * Custom hook quản lý thời gian đếm ngược còn lại đến khi chốt sổ & reset rank tuần
 */
export function useRankCountdown(): RankResetCountdown {
  const [countdown, setCountdown] = useState<RankResetCountdown>(() => getRankResetCountdown());

  useEffect(() => {
    // Cập nhật mỗi 30 giây để đảm bảo thời gian luôn chính xác
    const interval = setInterval(() => {
      setCountdown(getRankResetCountdown());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return countdown;
}
