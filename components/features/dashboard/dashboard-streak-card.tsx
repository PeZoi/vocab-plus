'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { StreakWeekDay } from '@/types/review.types';
import { useStreakCard } from '@/hooks/features/dashboard/use-streak-card';
import { CheckCircle2, Trophy, Zap, ArrowRight, Flame } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface DashboardStreakCardProps {
  streakDays: number;
  hasReviewedToday: boolean;
  weekDays?: StreakWeekDay[];
  freezesAvailable?: number;
  longestStreak?: number;
}

export function DashboardStreakCard({
  streakDays,
  hasReviewedToday,
  weekDays = [],
  freezesAvailable = 0,
  longestStreak = 0,
}: DashboardStreakCardProps) {
  const { days, completedThisWeek, weeklyPercent } = useStreakCard({
    streakDays,
    hasReviewedToday,
    weekDays,
  });

  const bestStreak = Math.max(longestStreak, streakDays);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6A00] via-[#F44300] to-[#C91A00] p-4 sm:p-5 shadow-[0_8px_32px_-4px_rgba(244,67,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.2)] border border-white/25 text-white flex flex-col justify-between h-full group"
    >
      {/* Specular top highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      {/* Ambient background glow layers */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -left-10 w-32 h-32 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-36 h-36 rounded-full bg-red-700/25 blur-xl pointer-events-none" />

      {/* TẦNG 1: Header - Tiêu đề tiến độ tuần & Kỷ lục */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-xs">
          <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
          <h2 className="text-[11px] font-black tracking-wider uppercase drop-shadow-xs text-white">
            TIẾN ĐỘ TUẦN
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {freezesAvailable > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-cyan-400/25 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-cyan-200/40 text-cyan-100 shadow-xs">
              <span>❄️</span>
              <span>{freezesAvailable}</span>
            </span>
          )}

          {bestStreak > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400/25 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/40 text-amber-100 shadow-xs">
              <Trophy className="w-3 h-3 text-amber-200" />
              <span>Kỷ lục: {bestStreak}d</span>
            </span>
          )}
        </div>
      </div>

      {/* TẦNG 2: Chỉ số tóm tắt tinh gọn (Streak ngày & Số ngày đã học trong tuần) */}
      <div className="relative z-10 my-2 flex items-end justify-between gap-3">
        {/* Cột trái: Con số Streak gọn gàng */}
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md leading-none text-white font-sans">
              {streakDays}
            </span>
            <span className="text-base sm:text-lg font-bold text-white/90">
              ngày chuỗi
            </span>
          </div>
          <p className="text-[11px] text-white/80 font-medium">
            {hasReviewedToday ? '✨ Đã thắp lửa thành công' : '⚡ Chưa hoàn thành hôm nay'}
          </p>
        </div>

        {/* Cột phải: Tiến độ tuần & thanh progress mini */}
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              Đã học:
            </span>
            <span className="text-sm sm:text-base font-black text-white">
              {completedThisWeek}/7 ngày
            </span>
          </div>

          <div className="w-24 sm:w-28 h-2 bg-black/25 rounded-full overflow-hidden border border-white/20 p-0.5 ml-auto">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* TẦNG 3: TRỌNG TÂM - 7 Ngày Trong Tuần (Rộng rãi, thoáng mắt, không đóng khung hộp rườm rà) */}
      <div className="relative z-10 py-2.5">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, idx) => {
            const isToday = day.is_today;
            const isCompleted = day.is_active;
            const isFuture = day.is_future;

            return (
              <div
                key={day.date || `${day.day_label}-${idx}`}
                className="flex flex-col items-center gap-1.5"
              >
                {/* Vòng tròn trạng thái ngày */}
                <div className="relative flex items-center justify-center">
                  {isToday ? (
                    isCompleted ? (
                      // Đã học hôm nay: Lên lửa + nền ngọc trắng sáng nổi bật 3D
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-white to-amber-50 border-2 border-amber-300 shadow-[0_0_12px_rgba(255,255,255,0.6)] flex items-center justify-center cursor-pointer select-none">
                        <span className="text-sm sm:text-base leading-none">🔥</span>
                      </div>
                    ) : (
                      // Chưa học hôm nay: Vòng tròn phát sáng với icon tia sét vàng mời gọi
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer">
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                      </div>
                    )
                  ) : isCompleted ? (
                    // Ngày đã học quá khứ: Huy hiệu ngọc lửa trắng 3D
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-white via-amber-50 to-amber-100 border border-white text-orange-600 shadow-[0_3px_8px_rgba(0,0,0,0.18)] flex items-center justify-center shadow-xs">
                      <span className="text-xs sm:text-sm leading-none">🔥</span>
                    </div>
                  ) : isFuture ? (
                    // Ngày tương lai: Viền nét đứt thanh lịch
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-dashed border-white/35 bg-transparent flex items-center justify-center" />
                  ) : (
                    // Ngày bỏ lỡ quá khứ: Kính mờ nhẹ nhàng với vạch ngang tinh tế
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <div className="w-2 h-[2px] rounded-full bg-white/35" />
                    </div>
                  )}
                </div>

                {/* Nhãn thứ (T2, T3, T4, T5, T6, T7, CN) */}
                <span
                  className={`text-[10px] sm:text-[11px] uppercase tracking-wider ${
                    isToday
                      ? 'text-white font-black scale-110 drop-shadow-sm'
                      : 'text-white/80 font-bold'
                  }`}
                >
                  {day.day_label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TẦNG 4: Nút hành động đáy (CTA) - Kính mờ mềm mại trải dài, lấp đầy tự nhiên */}
      <div className="relative z-10 pt-1">
        {hasReviewedToday ? (
          <div className="w-full py-2 px-3 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center gap-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Đã hoàn thành mục tiêu hôm nay!</span>
          </div>
        ) : (
          <Link
            href={ROUTES.APP.REVIEW}
            className="w-full py-2 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-[0.99] border border-white/35 flex items-center justify-between text-xs font-bold text-white shadow-sm hover:shadow-md backdrop-blur-md transition-all cursor-pointer group/cta"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0 group-hover/cta:scale-110 transition-transform" />
              <span>Ôn tập ngay để thắp lửa hôm nay</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/85 group-hover/cta:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
