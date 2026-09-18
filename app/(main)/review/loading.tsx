import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* 1. Header Progress Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-2 flex-1 max-w-xs rounded-full" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>

      {/* 2. 3D Flashcard Skeleton */}
      <div className="relative w-full min-h-[380px] sm:min-h-[420px] rounded-2xl p-6 sm:p-8 flex flex-col justify-between bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none">
        {/* Card Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-10 rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>

        {/* Card Center: Word & IPA */}
        <div className="flex flex-col items-center justify-center text-center my-6 space-y-4">
          <Skeleton className="h-10 w-52 rounded-xl" />
          <div className="flex items-center justify-center gap-3">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Card Bottom Hint */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3.5 w-64 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
      </div>

      {/* 3. Navigation Controls Skeleton */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-44 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
    </div>
  );
}
