import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCronJobsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="p-5 rounded-2xl bg-surface border border-border/70 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56 rounded" />
            <Skeleton className="h-4 w-96 rounded" />
          </div>
        </div>
      </div>

      {/* KPI skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-surface border border-border/70 space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-surface border border-border/70 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
