'use client';

import { DashboardActivityCalendar } from '@/components/features/dashboard/dashboard-activity-calendar';
import { DashboardCefrDistribution } from '@/components/features/dashboard/dashboard-cefr-distribution';
import { DashboardForecastChart } from '@/components/features/dashboard/dashboard-forecast-chart';
import { DashboardHeroBanner } from '@/components/features/dashboard/dashboard-hero-banner';
import { DashboardLevelDistribution } from '@/components/features/dashboard/dashboard-level-distribution';
import { DashboardRecentCards } from '@/components/features/dashboard/dashboard-recent-cards';
import { DashboardStreakCard } from '@/components/features/dashboard/dashboard-streak-card';
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
    longestStreak,
    todayXp,
    dailyXpCap,
    hasReviewedToday,
    freezesAvailable,
    weekDays,
    activityHistory,
    activitySummary,
  } = useDashboardMetrics();

  if (isLoading) {
    return <MainLoading />;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 pb-8"
    >
      {/* TẦNG 1: Daily Action Center (Toàn chiều rộng, cân đối, thoáng đãng) */}
      <DashboardHeroBanner
        dueCount={dueCount}
        learningCount={learningCount}
        masteredCount={masteredCount}
        todayXp={todayXp}
        dailyXpCap={dailyXpCap}
      />

      {/* TẦNG 2: Biểu đồ chuyên cần GitHub 52 tuần & Thẻ Chuỗi Ngày Học CÙNG HÀNG (Nhỏ gọn & cân đối) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <DashboardActivityCalendar
            activityHistory={activityHistory}
            activitySummary={activitySummary}
            streakDays={streakDays}
            longestStreak={longestStreak}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <DashboardStreakCard
            streakDays={streakDays}
            hasReviewedToday={hasReviewedToday}
            weekDays={weekDays}
            freezesAvailable={freezesAvailable}
          />
        </div>
      </div>

      {/* TẦNG 3: Phân tích học tập - Dự báo Spaced Repetition 7 ngày & Khu Vườn Từ Vựng */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <DashboardForecastChart forecast={forecast} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <DashboardLevelDistribution cards={cards} />
        </div>
      </div>

      {/* TẦNG 4: Danh sách thẻ cần ôn gấp & Phân bổ CEFR chuẩn quốc tế */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <DashboardRecentCards cards={cards} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <DashboardCefrDistribution
            cefrDistribution={cefrDistribution}
            totalCards={cards.length}
          />
        </div>
      </div>
    </motion.div>
  );
}

