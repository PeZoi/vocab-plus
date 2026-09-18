import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
      {/* 1. Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />
      </div>

      <div className="space-y-3.5">
        {/* 2. Theme Toggle Card Skeleton */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-64 max-w-xs rounded" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        {/* 3. Telegram Settings Card Skeleton */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-44 rounded" />
                <Skeleton className="h-3 w-56 rounded" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="p-4 rounded-xl bg-base/50 border border-border/40 space-y-3">
            <Skeleton className="h-3.5 w-full rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 4. Golden Hours Card Skeleton */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-60 rounded" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* 5. Sign out button */}
        <div className="pt-3 border-t border-border/50">
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
