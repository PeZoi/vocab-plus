import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Headphones, History, Sparkles, Keyboard } from 'lucide-react';

export default function ListeningLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* 1. HERO BANNER SKELETON (Mô phỏng ListeningHeroBanner) */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border/70 p-5 sm:p-8 shadow-xs space-y-6">
        {/* Glow hiệu ứng nền */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge & Title */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base border border-border/80">
              <Headphones className="w-3.5 h-3.5 text-brand/70" />
              <Skeleton className="h-3.5 w-48 sm:w-56 rounded-md" />
            </div>

            <Skeleton className="h-8 sm:h-9 w-72 sm:w-96 rounded-xl" />

            <div className="space-y-1.5 max-w-2xl pt-1">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
          </div>

          {/* Ô Nhập URL & Nút Bắt Đầu */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-12 w-full sm:w-44 rounded-2xl shrink-0" />
            </div>

            {/* Chọn Cấp Độ Luyện Nghe & Phím Tắt Hint */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20 rounded-md" />
                <div className="inline-flex p-1 rounded-xl bg-base border border-border/70 gap-1">
                  <Skeleton className="h-7 w-20 rounded-lg" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                  <Skeleton className="h-7 w-22 rounded-lg" />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand/60" />
                <Skeleton className="h-3.5 w-56 sm:w-64 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT LISTENING SHELF SKELETON (Mô phỏng RecentListeningShelf) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <History className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-5 w-52 sm:w-64 rounded-md" />
              <Skeleton className="h-3.5 w-72 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* 3 Card Items Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-surface border border-border/70 p-4 flex flex-col justify-between gap-3 overflow-hidden shadow-xs"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-28 aspect-video rounded-xl shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-14 rounded-md" />
                    <Skeleton className="h-4 w-10 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28 rounded-md" />
                  <Skeleton className="h-3 w-8 rounded-md" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
                <div className="pt-1 flex justify-end">
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EMPTY GUIDE & SHORTCUTS SKELETON (Mô phỏng ListeningEmptyGuide) */}
      <div className="space-y-6 pt-2">
        <div className="rounded-3xl bg-surface border border-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base border border-border">
                <Sparkles className="w-3.5 h-3.5 text-brand/70" />
                <Skeleton className="h-3.5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-6 w-72 sm:w-80 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="rounded-2xl bg-base/80 border border-border/70 p-5 space-y-4 flex flex-col justify-between min-h-[170px]"
              >
                <div className="space-y-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-14 rounded-md" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-3 w-full rounded-md" />
                    <Skeleton className="h-3 w-4/5 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-44 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts Bar Skeleton */}
        <div className="rounded-2xl bg-surface/60 border border-border/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-base border border-border flex items-center justify-center text-text-secondary">
              <Keyboard className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-56 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
