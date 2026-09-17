import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { useMemo } from 'react';

export function useDashboardMetrics() {
  const { data: statsData, isLoading: statsLoading } = useReviewStats();
  const { data: cards = [], isLoading: cardsLoading } = useCardsQuery();

  const stats = statsData?.stats;
  const forecast = statsData?.forecast || [];

  const cefrDistribution = useMemo(() => {
    const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    cards.forEach((c) => {
      const lvl = c.cefr_level?.toUpperCase();
      if (lvl && counts[lvl] !== undefined) {
        counts[lvl]++;
      }
    });
    return counts;
  }, [cards]);

  const dueCount = stats?.due_count || 0;
  const learningCount = stats?.learning_count || 0;
  const masteredCount = stats?.mastered_count || 0;
  const streakDays = stats?.streak_days || 0;
  const longestStreak = stats?.longest_streak || streakDays;
  const totalXp = stats?.total_xp || 0;
  const todayXp = stats?.today_xp || 0;
  const dailyXpCap = stats?.daily_xp_cap || 500;
  const hasReviewedToday = Boolean(stats?.has_reviewed_today);
  const freezesAvailable = stats?.freezes_available || 0;
  const weekDays = stats?.week_days || [];
  const activityHistory = stats?.activity_history || [];
  const activitySummary = stats?.activity_summary;

  return {
    isLoading: statsLoading || cardsLoading,
    cards,
    forecast,
    cefrDistribution,
    dueCount,
    learningCount,
    masteredCount,
    streakDays,
    longestStreak,
    totalXp,
    todayXp,
    dailyXpCap,
    hasReviewedToday,
    freezesAvailable,
    weekDays,
    activityHistory,
    activitySummary,
  };
}
