import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 flex-1 max-w-xs rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Flashcard Skeleton */}
      <div className="relative w-full min-h-[380px] sm:min-h-[420px] rounded-2xl p-6 sm:p-8 flex flex-col justify-between bg-surface/50 border border-border/80">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="flex flex-col items-center justify-center text-center my-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center justify-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        <div className="flex justify-center">
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      {/* Bottom Button Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>
    </div>
  );
}
