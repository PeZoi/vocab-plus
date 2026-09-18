import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-pulse">
      {/* 1. Header Profile Card Skeleton */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1 w-full text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-64 max-w-sm rounded-md mx-auto sm:mx-0 pt-1" />
        </div>
        <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
      </div>

      {/* 2. League Rank Card Skeleton */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
          <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
          <div className="space-y-3 flex-1 w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        </div>

        {/* 2 Box Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>

      {/* 3. 3 Stat Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-2 text-center flex flex-col items-center"
          >
            <Skeleton className="w-8 h-8 rounded-lg mb-1" />
            <Skeleton className="h-6 w-12 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
