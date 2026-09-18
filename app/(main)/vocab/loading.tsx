import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function VocabLoading() {
  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto animate-pulse">
      {/* 1. Header Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-36 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
          {/* View toggle button group */}
          <Skeleton className="h-10 w-20 rounded-xl shrink-0" />
          {/* Action button */}
          <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 2. Filters Bar Skeleton */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* CEFR filter */}
          <Skeleton className="h-9 w-28 rounded-xl" />
          {/* Level filter */}
          <Skeleton className="h-9 w-32 rounded-xl" />
          {/* Tag filter */}
          <Skeleton className="h-9 w-28 rounded-xl" />
          {/* Sort filter */}
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 3. Cards Grid Skeleton (3x3 = 9 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Card Top: Badges & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-10 rounded-md" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>

              {/* Word & Pronunciation */}
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-36 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>

              {/* Definition */}
              <div className="space-y-1 pt-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
              </div>

              {/* Example sentence */}
              <div className="p-2.5 rounded-xl bg-base/50 border border-border/40 space-y-1">
                <Skeleton className="h-3.5 w-11/12 rounded-sm" />
                <Skeleton className="h-3 w-3/4 rounded-sm" />
              </div>
            </div>

            {/* Card Footer: Due info & Quick action */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
