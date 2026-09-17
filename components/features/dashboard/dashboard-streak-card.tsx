'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { StreakWeekDay } from '@/types/review.types';
import { useStreakCard } from '@/hooks/features/dashboard/use-streak-card';
import { CheckCircle2, Flame, Sparkles, Trophy, Zap } from 'lucide-react';

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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7A00] via-[#FF5500] to-[#E03500] p-4 sm:p-5 shadow-xl shadow-orange-600/20 border border-white/25 text-white flex flex-col justify-between h-full group"
    >
      {/* Lớp nền ánh sáng ambient và hiệu ứng glow đa tầng */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -left-10 w-28 h-28 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-32 h-32 rounded-full bg-red-600/25 blur-xl pointer-events-none" />

      {/* TẦNG 1: Header - Huy hiệu tiêu đề & Huy hiệu kỷ lục / bảo lưu */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 shadow-xs">
          <span className="text-sm select-none" role="img" aria-label="flame">
            🔥
          </span>
          <h2 className="text-[11px] font-black tracking-wider uppercase drop-shadow-xs text-white">
            CHUỖI NGÀY HỌC
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {freezesAvailable > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/25 text-white">
              <span>❄️</span>
              <span>{freezesAvailable}</span>
            </span>
          )}

          {bestStreak > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400/25 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-300/35 text-amber-100 shadow-xs">
              <Trophy className="w-3 h-3 text-amber-200" />
              <span>Kỷ lục: {bestStreak}d</span>
            </span>
          )}
        </div>
      </div>

      {/* TẦNG 2: Thân thẻ - Chia 2 cột cân đối, loại bỏ hoàn toàn khoảng trống */}
      <div className="relative z-10 my-3 flex items-center justify-between gap-3">
        {/* Cột trái: Con số chuỗi ngày to đẹp & Nhãn trạng thái */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md leading-none text-white">
              {streakDays}
            </span>
            <span className="text-lg sm:text-xl font-bold text-white/95">
              ngày
            </span>
          </div>

          <div>
            {hasReviewedToday ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/25 border border-emerald-300/35 text-white text-[11px] font-semibold backdrop-blur-xs shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>Đã thắp lửa hôm nay!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-white/25 text-white text-[11px] font-semibold backdrop-blur-xs">
                <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-bounce" />
                <span>Ôn tập ngay để thắp lửa!</span>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Thẻ nhỏ vinh danh tiến độ tuần (Lấp đầy không gian trống) */}
        <div className="relative shrink-0 p-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm flex flex-col items-center justify-center text-center min-w-[105px]">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1 text-base shadow-inner"
          >
            🔥
          </motion.div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
            Tuần này
          </span>
          <span className="text-xs font-black text-white">
            {completedThisWeek}/7 ngày
          </span>

          {/* Mini progress bar */}
          <div className="w-14 h-1.5 bg-black/25 rounded-full overflow-hidden mt-1 border border-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-300 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* TẦNG 3: Khung kính 7 ngày tiến độ (Glassmorphic Pod) */}
      <div className="relative z-10 p-2.5 sm:p-3 rounded-xl bg-black/15 backdrop-blur-md border border-white/20 shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/85 mb-2 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>Tiến độ tuần hiện tại</span>
          </span>
          <span className="font-mono text-white/90 font-bold">
            {completedThisWeek === 7 ? 'Hoàn thành 100% 🏆' : `${7 - completedThisWeek} ngày nữa`}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {days.map((day, idx) => {
            const isToday = day.is_today;
            const isCompleted = day.is_active;
            const isFuture = day.is_future;

            return (
              <div
                key={day.date || `${day.day_label}-${idx}`}
                className="flex flex-col items-center gap-1.5"
              >
                {/* Vòng tròn trạng thái */}
                <div className="relative flex items-center justify-center">
                  {isToday ? (
                    // NGÀY HIỆN TẠI
                    isCompleted ? (
                      // Đã học hôm nay: Lên lửa + vòng tròn trắng phát sáng hào quang
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)] flex items-center justify-center cursor-pointer select-none"
                      >
                        <span className="text-sm sm:text-base leading-none">🔥</span>
                      </motion.div>
                    ) : (
                      // Chưa học hôm nay: Active sáng lên viền trắng phát sáng
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/25 border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.9)] flex items-center justify-center cursor-pointer"
                      >
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </motion.div>
                    )
                  ) : isCompleted ? (
                    // NGÀY CÓ STREAK TRONG QUÁ KHỨ: LÊN LỬA 🔥
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/30 backdrop-blur-xs border border-white/25 flex items-center justify-center shadow-xs">
                      <span className="text-xs sm:text-sm leading-none">🔥</span>
                    </div>
                  ) : isFuture ? (
                    // NGÀY TƯƠNG LAI: Vòng tròn viền mỏng trong suốt
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/45 bg-transparent flex items-center justify-center" />
                  ) : (
                    // NGÀY BỎ LỠ TRONG QUÁ KHỨ (KHÔNG CÓ STREAK)
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/20 flex items-center justify-center text-white/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
                    </div>
                  )}
                </div>

                {/* Nhãn thứ trong tuần (T2, T3, T4, T5, T6, T7, CN) */}
                <span
                  className={`text-[10px] sm:text-[11px] font-bold tracking-wide uppercase ${
                    isToday ? 'text-white font-black scale-105 drop-shadow-xs' : 'text-white/80'
                  }`}
                >
                  {day.day_label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
