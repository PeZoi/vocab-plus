import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImportLoading() {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-6 animate-pulse">
      {/* 1. Header & Tabs Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border/70">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* 2. Input Form Card Skeleton */}
      <div className="rounded-2xl bg-surface border border-border/70 p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-5">
        {/* Title Input */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        {/* Big Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-11 w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
