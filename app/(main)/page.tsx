'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Button } from '@/components/ui/button';
import { pageVariants, staggerContainer, staggerItem } from '@/constants/animations';
import { CEFR_LEVELS_CONFIG, CEFR_LEVELS_LIST } from '@/constants/cefr';
import { ROUTES } from '@/constants/routes';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { formatRelativeTime } from '@/utils/datetime';
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';
import MainLoading from './loading';

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useReviewStats();
  const { data: cards = [], isLoading: cardsLoading } = useCardsQuery();

  const stats = statsData?.stats;
  const forecast = statsData?.forecast || [];

  const cefrDistribution = React.useMemo(() => {
    const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    cards.forEach((c) => {
      const lvl = c.cefr_level?.toUpperCase();
      if (lvl && counts[lvl] !== undefined) {
        counts[lvl]++;
      }
    });
    return counts;
  }, [cards]);

  if (statsLoading || cardsLoading) {
    return <MainLoading />;
  }

  const dueCount = stats?.due_count || 0;
  const learningCount = stats?.learning_count || 0;
  const masteredCount = stats?.mastered_count || 0;
  const streakDays = stats?.streak_days || 0;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Hero Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-surface/90 border border-border/80 p-5 sm:p-6 shadow-sm"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-lg">
            <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
              {dueCount > 0 ? (
                <>
                  Bạn có <span className="text-brand font-bold">{dueCount}</span> từ cần ôn tập hôm nay
                </>
              ) : (
                'Hôm nay bạn đã ôn tập đầy đủ!'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {dueCount > 0
                ? 'Ôn tập đúng lúc theo chu kỳ lặp lại ngắt quãng giúp tăng tỷ lệ ghi nhớ dài hạn lên 90%.'
                : 'Mục tiêu hoàn thành xuất sắc! Hãy bổ sung thêm các từ mới để tiếp tục mở rộng vốn từ.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {dueCount > 0 ? (
              <Link href={ROUTES.APP.REVIEW}>
                <Button size="default" variant="primary" className="gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Bắt đầu ôn ({dueCount})</span>
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.APP.ADD}>
                <Button size="default" variant="primary" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Thêm từ mới</span>
                </Button>
              </Link>
            )}
            <Link href={ROUTES.APP.VOCAB}>
              <Button size="default" variant="surface" className="gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Kho từ vựng</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 4 Stat Cards with Stagger and Hover Motion */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary">Cần ôn tập</span>
              <p className="text-2xl font-bold text-brand">{dueCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary">Đang học</span>
              <p className="text-2xl font-bold text-text-primary">{learningCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary">Đã thuộc</span>
              <p className="text-2xl font-bold text-success">{masteredCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary">Chuỗi học</span>
              <p className="text-2xl font-bold text-amber-400">{streakDays} ngày</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Middle Grid: 7-Day Forecast (2/3) + CEFR Distribution (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Forecast Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Dự báo lượt ôn tập 7 ngày tới (FSRS)
              </h3>
            </div>
            <span className="text-[11px] text-text-secondary">Lịch tự động theo trí nhớ</span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-3 flex-1 w-full min-h-[160px]">
            {forecast.map((day, idx) => {
              const maxCount = Math.max(...forecast.map((f) => f.count), 1);
              const heightPercent =
                day.count > 0 ? Math.max(Math.round((day.count / maxCount) * 100), 10) : 0;
              const isToday = idx === 0;

              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span
                    className={`text-[11px] font-mono font-medium transition-colors ${
                      isToday ? 'text-brand font-bold' : 'text-text-secondary'
                    }`}
                  >
                    {day.count}
                  </span>
                  <div className="w-full max-w-[38px] sm:max-w-[44px] bg-base rounded-lg overflow-hidden flex items-end flex-1 min-h-[120px] border border-border/60">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
                      className={`w-full rounded-b-md transition-colors ${
                        isToday
                          ? 'bg-brand shadow-xs shadow-brand/40'
                          : day.count > 0
                          ? 'bg-brand/50 hover:bg-brand/70'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] truncate max-w-full text-center ${
                      isToday ? 'text-brand font-semibold' : 'text-text-secondary'
                    }`}
                  >
                    {day.day_label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEFR Level Distribution Card */}
        <div className="p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Phân bổ Cấp độ CEFR
              </h3>
            </div>
            <span className="text-[11px] text-text-secondary">Chuẩn quốc tế</span>
          </div>

          <div className="space-y-2 py-1">
            {CEFR_LEVELS_LIST.map((lvl) => {
              const count = cefrDistribution[lvl] || 0;
              const maxLvl = Math.max(...Object.values(cefrDistribution), 1);
              const pct = cards.length > 0 ? Math.round((count / cards.length) * 100) : 0;
              const config = CEFR_LEVELS_CONFIG[lvl];

              return (
                <div key={lvl} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <CEFRBadge level={lvl} size="sm" />
                      <span className="text-[11px] text-text-secondary font-medium">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-text-primary">{count}</span>
                      <span className="text-[10px] text-text-secondary">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-base rounded-full overflow-hidden border border-border/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxLvl) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${config.barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* My Vocabulary List (Recent Cards) */}
      <div className="p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Bộ từ vựng gần đây ({cards.length})
            </h3>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Danh sách các từ vựng bạn đã lưu vào hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={ROUTES.APP.VOCAB}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand hover:text-brand-hover">
                <span>Xem tất cả ({cards.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href={ROUTES.APP.ADD}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm từ</span>
              </Button>
            </Link>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="py-8 text-center text-text-secondary text-xs">
            Bạn chưa có từ vựng nào trong bộ thẻ.{' '}
            <Link href={ROUTES.APP.ADD} className="text-brand font-medium hover:underline">
              Bấm vào đây để thêm từ đầu tiên!
            </Link>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="divide-y divide-border/50"
          >
            {cards.slice(0, 10).map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-surface-hover/30 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AudioButton text={item.word} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-text-primary truncate">
                        {item.word}
                      </span>
                      {item.cefr_level && (
                        <CEFRBadge level={item.cefr_level} size="sm" />
                      )}
                      {item.ipa && (
                        <span className="font-mono text-[11px] text-text-secondary hidden sm:inline">
                          {item.ipa}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {item.definition}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-text-secondary block">
                    {formatRelativeTime(item.created_at || new Date())}
                  </span>
                  <span className="text-[9px] font-mono text-brand font-medium">
                    {item.source_type === 'ai_generated' ? 'AI' : 'Thủ công'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
