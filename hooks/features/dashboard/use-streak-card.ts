'use client';

import { useMemo } from 'react';
import type { StreakWeekDay } from '@/types/review.types';

interface UseStreakCardParams {
  streakDays: number;
  hasReviewedToday: boolean;
  weekDays?: StreakWeekDay[];
}

export function useStreakCard({
  hasReviewedToday,
  weekDays = [],
}: UseStreakCardParams) {
  // Chuẩn bị danh sách 7 ngày trong tuần, có fallback nếu chưa nạp
  const days: StreakWeekDay[] = useMemo(() => {
    if (weekDays.length === 7) return weekDays;

    return [
      { date: '', day_label: 'T2', full_label: 'Thứ Hai', day_number: 1, is_today: false, is_past: true, is_future: false, is_active: true },
      { date: '', day_label: 'T3', full_label: 'Thứ Ba', day_number: 2, is_today: false, is_past: true, is_future: false, is_active: true },
      { date: '', day_label: 'T4', full_label: 'Thứ Tư', day_number: 3, is_today: false, is_past: true, is_future: false, is_active: true },
      { date: '', day_label: 'T5', full_label: 'Thứ Năm', day_number: 4, is_today: true, is_past: false, is_future: false, is_active: hasReviewedToday },
      { date: '', day_label: 'T6', full_label: 'Thứ Sáu', day_number: 5, is_today: false, is_past: false, is_future: true, is_active: false },
      { date: '', day_label: 'T7', full_label: 'Thứ Bảy', day_number: 6, is_today: false, is_past: false, is_future: true, is_active: false },
      { date: '', day_label: 'CN', full_label: 'Chủ Nhật', day_number: 7, is_today: false, is_past: false, is_future: true, is_active: false },
    ];
  }, [weekDays, hasReviewedToday]);

  const statusMessage = hasReviewedToday
    ? '🔥 Bạn đã thắp lửa thành công hôm nay!'
    : '⚡ Ôn tập hôm nay để thắp sáng ngọn lửa!';

  const completedThisWeek = days.filter((d) => d.is_active).length;
  const weeklyPercent = Math.round((completedThisWeek / 7) * 100);

  return {
    days,
    statusMessage,
    completedThisWeek,
    weeklyPercent,
  };
}
