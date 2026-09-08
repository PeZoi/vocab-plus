'use client';

import { Clock } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface ForecastDay {
  date: string;
  day_label: string;
  count: number;
}

interface DashboardForecastChartProps {
  forecast: ForecastDay[];
}

export function DashboardForecastChart({ forecast }: DashboardForecastChartProps) {
  const maxCount = Math.max(...forecast.map((f) => f.count), 1);

  return (
    <div className="lg:col-span-2 p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Dự báo lượt ôn tập 7 ngày tới
          </h3>
        </div>
        <span className="text-[11px] text-text-secondary">Lịch tự động theo trí nhớ</span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-3 flex-1 w-full min-h-[160px]">
        {forecast.map((day, idx) => {
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
  );
}
