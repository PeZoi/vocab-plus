'use client';

import { DashboardCefrDistribution } from '@/components/features/dashboard/dashboard-cefr-distribution';
import { DashboardForecastChart } from '@/components/features/dashboard/dashboard-forecast-chart';
import { DashboardHeroBanner } from '@/components/features/dashboard/dashboard-hero-banner';
import { DashboardRecentCards } from '@/components/features/dashboard/dashboard-recent-cards';
import { DashboardStatsGrid } from '@/components/features/dashboard/dashboard-stats-grid';
import { pageVariants } from '@/constants/animations';
import { useDashboardMetrics } from '@/hooks/features/dashboard/use-dashboard-metrics';
import { motion } from 'motion/react';
import React from 'react';
import MainLoading from './loading';

export default function DashboardPage() {
  const {
    isLoading,
    cards,
    forecast,
    cefrDistribution,
    dueCount,
    learningCount,
    masteredCount,
    streakDays,
  } = useDashboardMetrics();

  if (isLoading) {
    return <MainLoading />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Hero Action Banner */}
      <DashboardHeroBanner dueCount={dueCount} />

      {/* 4 Stat Cards */}
      <DashboardStatsGrid
        dueCount={dueCount}
        learningCount={learningCount}
        masteredCount={masteredCount}
        streakDays={streakDays}
      />

      {/* 7-Day Forecast & CEFR Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardForecastChart forecast={forecast} />
        <DashboardCefrDistribution
          cefrDistribution={cefrDistribution}
          totalCards={cards.length}
        />
      </div>

      {/* Recent Cards List */}
      <DashboardRecentCards cards={cards} />
    </motion.div>
  );
}
