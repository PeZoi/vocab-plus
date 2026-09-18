import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
      {/* 1. Page Title */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* 2. Segmented Control Tabs */}
      <div className="flex p-1 rounded-xl bg-surface border border-border/70 max-w-lg">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg ml-1" />
        <Skeleton className="h-8 flex-1 rounded-lg ml-1" />
      </div>

      {/* 3. Form Card Skeleton */}
      <div className="rounded-2xl bg-surface border border-border/70 p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-6">
        {/* Main Input with AI Button */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="flex gap-2.5">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl shrink-0" />
          </div>
        </div>

        {/* Hints or Preview info */}
        <div className="p-4 rounded-xl bg-base/50 border border-border/40 space-y-2">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
        </div>

        {/* 2 Sub-fields (Part of speech, CEFR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Definition */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        {/* Example sentence */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
