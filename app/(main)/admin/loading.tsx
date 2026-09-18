import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminGeneralLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Table / List Container Skeleton */}
      <div className="rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border/50 bg-base/40 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
