'use client';

import React from 'react';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { HeaderBrand } from '@/components/layouts/header/header-brand';
import { HeaderStreak } from '@/components/layouts/header/header-streak';
import { HeaderXpWidget } from '@/components/layouts/header/header-xp-widget';
import { HeaderQuestsButton } from '@/components/layouts/header/header-quests-button';
import { HeaderUserActions } from '@/components/layouts/header/header-user-actions';

export function AppHeader() {
  const { data } = useReviewStats();

  const streak = data?.stats.streak_days || 0;
  const xp = data?.stats.total_xp || 0;
  const todayXp = data?.stats.today_xp || 0;
  const xpCap = data?.stats.daily_xp_cap || 500;
  const isStreakActive = Boolean(data?.stats.has_reviewed_today);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-base/85 backdrop-blur-md h-16 flex items-center px-4 sm:px-6 justify-between">
      <HeaderBrand />

      <div className="flex items-center gap-2 sm:gap-3">
        <HeaderStreak streak={streak} isStreakActive={isStreakActive} />
        <HeaderXpWidget totalXp={xp} todayXp={todayXp} xpCap={xpCap} />
        <HeaderQuestsButton />
        <HeaderUserActions />
      </div>
    </header>
  );
}
