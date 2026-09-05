import { Skeleton } from '@/components/ui/skeleton';

export function VocabDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 pt-2">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div className="p-7 rounded-2xl bg-surface/70 border border-border/70 space-y-5">
            <Skeleton className="h-10 w-52 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="p-6 rounded-2xl bg-surface/70 border border-border/70 space-y-4">
            <Skeleton className="h-6 w-44 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 rounded-2xl bg-surface/70 border border-border/70 space-y-4">
            <Skeleton className="h-6 w-36 rounded-md" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
