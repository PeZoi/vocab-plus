'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { StreakWeekDay } from '@/types/review.types';
import { useStreakCard } from '@/hooks/features/dashboard/use-streak-card';

interface DashboardStreakCardProps {
  streakDays: number;
  hasReviewedToday: boolean;
  weekDays?: StreakWeekDay[];
  freezesAvailable?: number;
}

export function DashboardStreakCard({
  streakDays,
  hasReviewedToday,
  weekDays = [],
  freezesAvailable = 0,
}: DashboardStreakCardProps) {
  const { days, statusMessage } = useStreakCard({
    streakDays,
    hasReviewedToday,
    weekDays,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7A00] via-[#FF5F00] to-[#E54800] p-4 sm:p-5 shadow-lg shadow-orange-600/15 border border-white/20 text-white flex flex-col justify-between h-full"
    >
      {/* Lớp nền ánh sáng ambient trang trí nhẹ nhàng */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-amber-400/15 blur-lg pointer-events-none" />

      {/* Header: Icon Lửa + CHUỖI NGÀY HỌC */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg drop-shadow-xs select-none" role="img" aria-label="flame">
            🔥
          </span>
          <h2 className="text-xs font-black tracking-wider uppercase drop-shadow-xs text-white/95">
            CHUỖI NGÀY HỌC
          </h2>
        </div>

        {/* Huy hiệu đóng băng bảo lưu nếu có */}
        {freezesAvailable > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/25">
            <span>❄️</span>
            <span>{freezesAvailable}</span>
          </span>
        )}
      </div>

      {/* Thân thẻ: Số ngày vừa vặn, tinh tế */}
      <div className="relative z-10 my-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm leading-none">
            {streakDays}
          </span>
          <span className="text-base sm:text-lg font-bold text-white/95">
            ngày
          </span>
        </div>
        <p className="mt-1 text-[11px] sm:text-xs text-white/85 font-medium line-clamp-1">
          {statusMessage}
        </p>
      </div>

      {/* Hàng 7 vòng tròn tiến độ ngày: Nhỏ gọn, cân đối */}
      <div className="relative z-10 pt-2.5 border-t border-white/20">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {days.map((day, idx) => {
            const isToday = day.is_today;
            const isCompleted = day.is_active; // Ngày này đã có hoạt động/streak
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
                      // Đã học hôm nay: Lên lửa + vòng tròn trắng phát sáng
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] flex items-center justify-center cursor-pointer select-none"
                      >
                        <span className="text-sm sm:text-base leading-none">🔥</span>
                      </motion.div>
                    ) : (
                      // Chưa học hôm nay: Active sáng lên thôi (không lên lửa), viền trắng phát sáng
                      <motion.div
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/25 border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.85)] flex items-center justify-center cursor-pointer"
                      >
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </motion.div>
                    )
                  ) : isCompleted ? (
                    // NGÀY CÓ STREAK TRONG QUÁ KHỨ: LÊN LỬA 🔥
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center shadow-xs">
                      <span className="text-xs sm:text-sm leading-none">🔥</span>
                    </div>
                  ) : isFuture ? (
                    // NGÀY TƯƠNG LAI: Vòng tròn viền mỏng trong suốt
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/50 bg-transparent flex items-center justify-center" />
                  ) : (
                    // NGÀY BỎ LỠ TRONG QUÁ KHỨ (KHÔNG CÓ STREAK)
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/15 flex items-center justify-center text-white/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    </div>
                  )}
                </div>

                {/* Nhãn thứ trong tuần (T2, T3, T4, T5, T6, T7, CN) */}
                <span
                  className={`text-[10px] sm:text-[11px] font-bold tracking-wide uppercase ${
                    isToday ? 'text-white font-black scale-105' : 'text-white/80'
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
