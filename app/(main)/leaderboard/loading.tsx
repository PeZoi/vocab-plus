import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 mt-4">
        <Skeleton className="w-16 h-16 rounded-2xl mb-2" />
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-sm rounded-md" />
      </div>

      {/* 2. Mode Tabs Skeleton */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-surface border border-border/70 w-fit mx-auto">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl ml-1" />
      </div>

      {/* 3. Timeframe Tabs */}
      <div className="flex items-center justify-center bg-surface/60 p-1.5 rounded-2xl border border-border/70 w-fit mx-auto">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-8 w-32 rounded-xl ml-1" />
        <Skeleton className="h-8 w-24 rounded-xl ml-1" />
      </div>

      {/* 4. Weekly League Tier Status Banner Skeleton */}
      <div className="p-5 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4.5 w-32 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        {/* 2 Rules Box */}
        <div className="pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-base/50 border border-border/40 space-y-1">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
          <div className="p-2.5 rounded-xl bg-base/50 border border-border/40 space-y-1">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        </div>

        {/* Countdown */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-6 w-36 rounded-lg" />
        </div>
      </div>

      {/* 5. Podium Top 3 Skeleton */}
      <div className="pt-4 pb-2 flex items-end justify-center gap-3 sm:gap-6">
        {/* Rank 2 (Silver) */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[130px]">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded" />
          <Skeleton className="h-5 w-12 rounded-md" />
          <div className="w-full h-24 rounded-t-2xl bg-surface border border-border/70 flex items-center justify-center">
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>

        {/* Rank 1 (Gold - Cao nhất) */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <div className="w-full h-32 rounded-t-2xl bg-surface border border-border/70 flex items-center justify-center">
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[130px]">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded" />
          <Skeleton className="h-5 w-12 rounded-md" />
          <div className="w-full h-20 rounded-t-2xl bg-surface border border-border/70 flex items-center justify-center">
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </div>

      {/* 6. List rows (Rank 4-8) */}
      <div className="rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-5 rounded" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
