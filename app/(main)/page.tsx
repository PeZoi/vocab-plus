'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  Flame,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioButton } from '@/components/common/audio-button';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { formatRelativeTime } from '@/utils/datetime';
import { ROUTES } from '@/constants/routes';
import { pageVariants, staggerContainer, staggerItem } from '@/constants/animations';
import MainLoading from './loading';

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useReviewStats();
  const { data: cards = [], isLoading: cardsLoading } = useCardsQuery();

  const stats = statsData?.stats;
  const forecast = statsData?.forecast || [];

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

          <div className="flex items-center gap-2.5 shrink-0">
            {dueCount > 0 ? (
              <Link href={ROUTES.APP.REVIEW}>
                <Button size="default" variant="primary" className="gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Bắt đầu ôn ({dueCount})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
            <Link href={ROUTES.APP.ADD}>
              <Button size="default" variant="surface" className="gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Nhập từ</span>
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
        {/* Due Today */}
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-surface/80 border border-border/70 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cần ôn hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-text-primary tracking-tight">
              {dueCount}
            </span>
            <span className="text-xs text-text-secondary">từ</span>
          </div>
        </motion.div>

        {/* Learning */}
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-surface/80 border border-border/70 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Đang học</span>
            <div className="w-7 h-7 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-text-primary tracking-tight">
              {learningCount}
            </span>
            <span className="text-xs text-text-secondary">từ</span>
          </div>
        </motion.div>

        {/* Mastered */}
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-surface/80 border border-border/70 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Đã thành thạo</span>
            <div className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-text-primary tracking-tight">
              {masteredCount}
            </span>
            <span className="text-xs text-text-secondary">từ</span>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          variants={staggerItem}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl bg-surface/80 border border-border/70 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-[11px] font-medium uppercase tracking-wider">Chuỗi Streak</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-amber-400 tracking-tight">
              {streakDays}
            </span>
            <span className="text-xs text-text-secondary">ngày</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 7-Day Forecast Chart */}
      <div className="p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Dự báo lượt ôn tập 7 ngày tới (FSRS Forecast)
            </h3>
          </div>
          <span className="text-[11px] text-text-secondary">Tự động tính theo chu kỳ trí nhớ</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-3 items-end min-h-[120px]">
          {forecast.map((day, idx) => {
            const maxCount = Math.max(...forecast.map((f) => f.count), 5);
            const heightPercent = Math.max(Math.round((day.count / maxCount) * 100), 12);
            const isToday = idx === 0;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-mono font-medium text-text-secondary">
                  {day.count}
                </span>
                <div className="w-full max-w-[36px] bg-base rounded-md overflow-hidden flex items-end h-20 border border-border/60">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-md transition-colors ${
                      isToday
                        ? 'bg-brand'
                        : 'bg-surface-hover hover:bg-brand/30'
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
          <Link href={ROUTES.APP.ADD}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ</span>
            </Button>
          </Link>
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
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-text-primary truncate">
                        {item.word}
                      </span>
                      {item.ipa && (
                        <span className="font-mono text-[11px] text-text-secondary hidden sm:inline">
                          {item.ipa}
                        </span>
                      )}
                      {item.part_of_speech && (
                        <Badge variant="secondary" className="text-[9px] py-0 px-1.5">
                          {item.part_of_speech}
                        </Badge>
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
