import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading cho UserProfileDetailView (dùng trong /profile/[id] và /admin/users/[id])
 */
export function UserProfileDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Header Profile Card Skeleton */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border/80 relative overflow-hidden space-y-5 shadow-lg">
        {/* Ambient top bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-border/50" />

        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />

            {/* Main info */}
            <div className="space-y-2.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-7 w-48 sm:w-60 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md hidden sm:block" />
              </div>
            </div>
          </div>

          {/* Right badges */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 2. Learning Stats Grid Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-36 rounded-md" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`stat-skel-${idx}`}
              className="p-4 rounded-2xl bg-surface/80 border border-border/70 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Nhật ký hoạt động 52 tuần Skeleton */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface/80 border border-border/70 space-y-4 shadow-xs">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>

        {/* Heatmap Matrix placeholder */}
        <div className="pt-2 space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-56 rounded" />
          <Skeleton className="h-3.5 w-28 rounded" />
        </div>
      </div>

      {/* 4. Public Collections Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-3.5 w-28 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`col-skel-${idx}`}
              className="p-4 rounded-2xl bg-surface/80 border border-border/70 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loading cho trang Profile chính chủ (/profile)
 */
export function OwnProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-pulse">
      {/* 1. Header Profile Card */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border/80 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />

          <div className="space-y-2 flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Skeleton className="h-7 w-48 rounded-xl" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-64 max-w-sm pt-1 mx-auto sm:mx-0 rounded" />
          </div>

          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 2. League Rank & Tournament Status */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <Skeleton className="h-5 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />

          <div className="space-y-3 flex-1 w-full">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>

      {/* 3. Learning Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl col-span-2 sm:col-span-1" />
      </div>

      {/* 4. Nhật ký hoạt động 52 tuần */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface/80 border border-border/70 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>

      {/* 5. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Skeleton className="h-12 w-full rounded-2xl flex-1" />
        <Skeleton className="h-12 w-full sm:w-44 rounded-2xl" />
      </div>
    </div>
  );
}
