import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAIProvidersLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Notice Banner Skeleton */}
      <div className="p-4 rounded-xl bg-surface/50 border border-border/80 flex items-center gap-3">
        <Skeleton className="w-5 h-5 rounded-full shrink-0" />
        <Skeleton className="h-4 flex-1" />
      </div>

      {/* Provider Selector Card Skeleton */}
      <div className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-4">
        <Skeleton className="h-5 w-44" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Configuration Form Card Skeleton */}
      <div className="p-6 rounded-2xl bg-surface/50 border border-border/80 space-y-5">
        <Skeleton className="h-5 w-56" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
