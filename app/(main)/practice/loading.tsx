import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PracticeLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* 1. Header Banner Skeleton */}
      <div className="rounded-2xl p-6 sm:p-8 bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3">
        <Skeleton className="h-6 w-44 rounded-full" />
        <Skeleton className="h-8 w-64 sm:w-80 rounded-lg" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
      </div>

      {/* 2. Fast-Track Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-6 w-56 sm:w-72 rounded-md" />
          <Skeleton className="h-3.5 w-48 sm:w-80 rounded-md" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl shrink-0" />
      </div>

      {/* 3. 3 Game Mode Boxes Skeleton */}
      <div className="p-4 rounded-xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-2">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-base/50 border border-border/40 flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-md" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Configuration Form Skeleton */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-6">
        {/* Source selector */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-44 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-border/50 bg-base/50 space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-base/50 space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </div>
        </div>

        {/* Question count selector */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-40 rounded" />
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
