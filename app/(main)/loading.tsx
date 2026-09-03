import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainLoading() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface/50 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3 max-w-lg w-full">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-surface/50 border border-border/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Forecast Chart Skeleton */}
      <div className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 hidden sm:block" />
        </div>
        <div className="grid grid-cols-7 gap-2 pt-4 items-end h-32">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton className="w-full max-w-[48px] h-16 rounded-t-md" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent List Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface/40 border border-border/70 flex items-center justify-between"
            >
              <div className="space-y-2 w-2/3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
