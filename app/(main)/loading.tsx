import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* TẦNG 1: Daily Action Center Skeleton */}
      <div className="rounded-2xl bg-surface border border-border/70 p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-72 sm:w-96 rounded-lg" />
            <Skeleton className="h-4 w-48 sm:w-80 rounded-md" />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* 3 Metric Cards + XP Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border/50 bg-base/50 flex items-center gap-3.5"
            >
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-4">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2 w-48 rounded-full" />
        </div>
      </div>

      {/* TẦNG 2: Biểu đồ chuyên cần & Streak Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <div className="h-full rounded-2xl bg-surface border border-border/70 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
            {/* Heatmap grid mockup */}
            <div className="h-36 w-full rounded-xl bg-base/40 border border-border/40 p-4 flex flex-col justify-between">
              <div className="flex justify-between">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-6" />
                ))}
              </div>
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 h-20 overflow-hidden">
                {Array.from({ length: 7 * 20 }).map((_, i) => (
                  <Skeleton key={i} className="w-2.5 h-2.5 rounded-sm" />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-32" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3 w-8" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-3 h-3 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="h-full rounded-2xl bg-surface border border-border/70 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="flex items-center gap-3 py-2">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>

            {/* 7 ngày */}
            <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-border/40">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="h-3 w-5" />
                  <Skeleton className="w-7 h-7 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TẦNG 3: Dự báo SRS & Khu vườn từ vựng */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <div className="h-full rounded-2xl bg-surface border border-border/70 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            {/* 7 cột bar */}
            <div className="grid grid-cols-7 gap-3 pt-6 items-end h-40">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <Skeleton
                    className="w-full max-w-[40px] rounded-t-lg"
                    style={{ height: `${25 + (idx * 11) % 55}%` }}
                  />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="h-full rounded-2xl bg-surface border border-border/70 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="space-y-3 pt-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TẦNG 4: Danh sách thẻ cần ôn & Phân bổ CEFR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <div className="h-full rounded-2xl bg-surface border border-border/70 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-9 w-48 rounded-lg" />
            </div>

            <div className="space-y-2.5 pt-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border/60 bg-base/40 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4.5 w-28" />
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-4 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-3.5 w-3/4 max-w-sm" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="h-full rounded-2xl bg-surface border border-border/70 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>

            <div className="space-y-3.5 pt-2">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                <div key={lvl} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-4 w-7 rounded-md" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
