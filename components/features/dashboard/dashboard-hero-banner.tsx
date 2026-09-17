'use client';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { BookOpen, Layers, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface DashboardHeroBannerProps {
  dueCount: number;
  learningCount?: number;
  masteredCount?: number;
  todayXp?: number;
  dailyXpCap?: number;
}

export function DashboardHeroBanner({
  dueCount,
  learningCount = 0,
  masteredCount = 0,
  todayXp = 0,
  dailyXpCap = 500,
}: DashboardHeroBannerProps) {
  const xpPercent = Math.min(Math.round((todayXp / Math.max(dailyXpCap, 1)) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl bg-surface/95 border border-border/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
    >
      {/* Lớp nền gradient tinh tế */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Lời chào & Trạng thái ôn tập */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              {dueCount > 0 ? (
                <>
                  Bạn có <span className="text-brand font-black">{dueCount}</span> từ cần ôn tập hôm nay
                </>
              ) : (
                'Hôm nay bạn đã ôn tập đầy đủ!'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {dueCount > 0
                ? 'Lặp lại ngắt quãng (FSRS) giúp củng cố trí nhớ dài hạn vào đúng thời điểm vàng.'
                : 'Mục tiêu hoàn thành xuất sắc! Hãy bổ sung thêm từ mới để mở rộng vốn từ.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {dueCount > 0 ? (
              <Link href={ROUTES.APP.REVIEW}>
                <Button size="default" variant="primary" className="gap-2 shadow-sm shadow-brand/30">
                  <Layers className="w-4 h-4" />
                  <span>Bắt đầu ôn ({dueCount})</span>
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.APP.ADD}>
                <Button size="default" variant="primary" className="gap-2 shadow-sm shadow-brand/30">
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

        {/* Hàng dưới: Thanh tiến độ XP & 3 Thẻ chỉ số nhanh (Chia 2 cột cân đối) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Cột trái: Tiến độ XP */}
          <div className="md:col-span-5 p-3 rounded-xl bg-base/80 border border-border/60 flex flex-col justify-center space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <span>🎯 Mục tiêu XP hôm nay</span>
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                {todayXp} / {dailyXpCap} XP ({xpPercent}%)
              </span>
            </div>
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>

          {/* Cột phải: 3 Chỉ số nhanh gọn */}
          <div className="md:col-span-7 grid grid-cols-3 gap-2">
            <Link
              href={`${ROUTES.APP.VOCAB}?state=review`}
              className="p-2 sm:p-2.5 rounded-xl bg-base/60 border border-border/50 hover:border-brand/40 transition-colors group flex flex-col justify-center text-center sm:text-left"
            >
              <span className="text-[11px] text-text-secondary block group-hover:text-text-primary transition-colors">
                Cần ôn tập
              </span>
              <span className="text-base sm:text-lg font-bold text-brand">{dueCount}</span>
            </Link>

            <Link
              href={`${ROUTES.APP.VOCAB}?state=learning`}
              className="p-2 sm:p-2.5 rounded-xl bg-base/60 border border-border/50 hover:border-sky-500/40 transition-colors group flex flex-col justify-center text-center sm:text-left"
            >
              <span className="text-[11px] text-text-secondary block group-hover:text-text-primary transition-colors">
                Đang học
              </span>
              <span className="text-base sm:text-lg font-bold text-sky-400">{learningCount}</span>
            </Link>

            <Link
              href={`${ROUTES.APP.VOCAB}?state=mastered`}
              className="p-2 sm:p-2.5 rounded-xl bg-base/60 border border-border/50 hover:border-success/40 transition-colors group flex flex-col justify-center text-center sm:text-left"
            >
              <span className="text-[11px] text-text-secondary block group-hover:text-text-primary transition-colors">
                Đã thuộc
              </span>
              <span className="text-base sm:text-lg font-bold text-success">{masteredCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
