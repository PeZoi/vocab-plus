import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-pulse">
      {/* 1. Back link skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>

      {/* 2. Collection Detail Banner Skeleton */}
      <div className="rounded-2xl bg-surface border border-border/70 p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4 max-w-lg rounded-lg" />
            <Skeleton className="h-4 w-full max-w-xl rounded-md" />
            <Skeleton className="h-4 w-2/3 max-w-lg rounded-md" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. Word List Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        {/* List items */}
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-3/4 max-w-md rounded-md" />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
