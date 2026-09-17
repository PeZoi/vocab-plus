'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ActivityHistoryItem, ActivitySummary } from '@/types/review.types';
import { CalendarCheck, Flame, GitCommitHorizontal, Trophy } from 'lucide-react';
import { useActivityCalendar } from '@/hooks/features/dashboard/use-activity-calendar';

interface DashboardActivityCalendarProps {
  activityHistory?: ActivityHistoryItem[];
  activitySummary?: ActivitySummary;
  streakDays?: number;
  longestStreak?: number;
}

export function DashboardActivityCalendar({
  activityHistory = [],
  activitySummary,
  streakDays = 0,
  longestStreak = 0,
}: DashboardActivityCalendarProps) {
  const {
    weeks,
    monthLabels,
    totalReviews,
    activeDays,
    hoveredCell,
    getCellColorClass,
    handleMouseEnter,
    handleMouseLeave,
  } = useActivityCalendar({
    activityHistory,
    activitySummary,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl bg-surface/90 border border-border/80 p-4 sm:p-5 shadow-sm overflow-hidden h-full flex flex-col justify-between"
    >
      {/* Header Heatmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <GitCommitHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-text-primary tracking-tight">
                Nhật ký hoạt động
              </h3>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                52 tuần
              </span>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
              {totalReviews > 0
                ? `${totalReviews.toLocaleString('vi-VN')} lượt ôn tập đã hoàn thành trong năm nay`
                : 'Mỗi ngày ôn tập một chút để thắp sáng biểu đồ'}
            </p>
          </div>
        </div>

        {/* Các huy hiệu thống kê tóm tắt */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-base border border-border/60 text-[11px]">
            <Flame className="w-3 h-3 text-amber-400" />
            <span className="text-text-secondary">Hiện tại:</span>
            <span className="font-bold text-amber-400">{streakDays}d</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-base border border-border/60 text-[11px]">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-text-secondary">Kỷ lục:</span>
            <span className="font-bold text-yellow-400">{longestStreak}d</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-base border border-border/60 text-[11px]">
            <CalendarCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-text-secondary">Tổng ngày:</span>
            <span className="font-bold text-emerald-400">{activeDays}d</span>
          </div>
        </div>
      </div>

      {/* Vùng Lưới Heatmap có thể cuộn ngang mượt mà trên mobile */}
      <div className="overflow-x-auto pt-3.5 pb-1 scrollbar-thin scrollbar-thumb-border">
        <div className="min-w-[670px] select-none">
          {/* Hàng nhãn tháng */}
          <div className="flex text-[10px] font-mono text-text-secondary mb-1.5 pl-6">
            {weeks.map((_, wIdx) => {
              const monthMatch = monthLabels.find((m) => m.weekIndex === wIdx);
              return (
                <div key={`month-${wIdx}`} className="w-[12.5px] shrink-0 text-left">
                  {monthMatch && (
                    <span className="font-semibold text-text-secondary">
                      {monthMatch.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ma trận ô vuông 7 hàng x 52 tuần */}
          <div className="flex items-start gap-1">
            {/* Cột nhãn ngày trong tuần (T2, T4, T6) */}
            <div className="flex flex-col gap-[2.5px] text-[9px] font-mono text-text-secondary w-5 shrink-0 pt-0.5">
              <span className="h-[10px] leading-[10px]">T2</span>
              <span className="h-[10px] leading-[10px] opacity-0">T3</span>
              <span className="h-[10px] leading-[10px]">T4</span>
              <span className="h-[10px] leading-[10px] opacity-0">T5</span>
              <span className="h-[10px] leading-[10px]">T6</span>
              <span className="h-[10px] leading-[10px] opacity-0">T7</span>
              <span className="h-[10px] leading-[10px] opacity-0">CN</span>
            </div>

            {/* Các cột tuần */}
            <div className="flex gap-[2.5px] flex-1">
              {weeks.map((week, weekIdx) => (
                <div key={`week-${weekIdx}`} className="flex flex-col gap-[2.5px]">
                  {week.map((day) => {
                    const colorClass = getCellColorClass(day.level, day.isFuture);

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={handleMouseLeave}
                        className={`w-[10px] h-[10px] rounded-[2px] border transition-all duration-150 cursor-pointer relative ${colorClass} ${
                          day.isToday ? 'ring-1 ring-brand/80 ring-offset-1 ring-offset-surface' : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Chú giải mức độ đóng góp (Ít -> Nhiều) */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-text-secondary flex-wrap gap-2">
        <span className="text-[11px]">
          Duy trì thói quen học ít nhất 1 bài mỗi ngày để không bị gián đoạn chuỗi.
        </span>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Ít</span>
          <div className="flex items-center gap-1">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-white/[0.04] border border-white/[0.05]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-950/80 border border-emerald-800/40" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-800 border border-emerald-700/60" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-600 border border-emerald-500/80" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400 border border-emerald-300" />
          </div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Floating Tooltip khi hover ô vuông */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: hoveredCell.x,
              top: hoveredCell.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
            className="z-50 pointer-events-none rounded-xl bg-surface border border-border px-3 py-2 text-xs shadow-xl min-w-[170px]"
          >
            <p className="font-semibold text-text-primary text-[11px]">
              {hoveredCell.formattedDate}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-text-secondary gap-3">
              <span>
                {hoveredCell.count > 0 ? (
                  <strong className="text-emerald-400 font-bold">
                    {hoveredCell.count} lượt ôn tập
                  </strong>
                ) : (
                  'Không có hoạt động'
                )}
              </span>
              {hoveredCell.xp > 0 && (
                <span className="font-mono text-amber-400 font-semibold">
                  +{hoveredCell.xp} XP
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
