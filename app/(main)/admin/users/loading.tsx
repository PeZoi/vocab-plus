import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <div>
              <Skeleton className="h-7 w-52 rounded-lg" />
              <Skeleton className="h-3.5 w-72 rounded-md mt-1" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="w-7 h-7 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-14 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/70">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* 4. Users Table Skeleton */}
      <div className="rounded-2xl bg-surface border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded hidden md:block" />
          <Skeleton className="h-4 w-24 rounded hidden sm:block" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>

        {/* 6 Table Rows */}
        <div className="divide-y divide-border/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-[200px]">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded hidden md:block" />
              <Skeleton className="h-5 w-20 rounded-md hidden sm:block" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
