import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionsLoading() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-64 sm:w-80 rounded-lg" />
            <Skeleton className="h-3.5 w-48 sm:w-96 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
      </div>

      {/* 2. Tabs Switcher Skeleton */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* 3. Filters Bar Skeleton */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl hidden sm:block" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* 4. Collections Grid Skeleton (6 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-4.5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              <div className="space-y-1.5">
                <Skeleton className="h-5.5 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-3.5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
