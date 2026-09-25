'use client';

import React from 'react';
import Image from 'next/image';
import { History, PlayCircle, CheckCircle2, Clock } from 'lucide-react';
import type { UserListeningProgressWithMeta, ListeningDifficulty } from '@/types/listening.types';

interface RecentListeningShelfProps {
  historyList: UserListeningProgressWithMeta[];
  onSelectPodcast: (youtubeId: string, difficulty: ListeningDifficulty) => void;
  isLoading?: boolean;
}

export function RecentListeningShelf({
  historyList,
  onSelectPodcast,
  isLoading = false,
}: RecentListeningShelfProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-56 bg-surface rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-surface border border-border/70" />
          ))}
        </div>
      </div>
    );
  }

  if (!historyList || historyList.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Bài Học Đang Dở & Đã Nghe Gần Đây
            </h2>
            <p className="text-xs text-text-secondary">
              Tiếp tục bài tập chép chính tả đúng vị trí câu bạn đang làm dở
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface border border-border text-text-secondary">
          {historyList.length} bài đã lưu
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {historyList.map((item) => {
          const total = item.totalSegments || 0;
          const completedCount = item.completedSegmentIds?.length || 0;
          const percent = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;
          const currentSentenceNum = (item.currentIndex ?? 0) + 1;

          return (
            <div
              key={`${item.youtubeId}-${item.difficulty}`}
              className="group relative rounded-2xl bg-surface border border-border/80 hover:border-brand/50 transition-all shadow-xs hover:shadow-md hover:shadow-brand/5 p-4 flex flex-col justify-between gap-3 overflow-hidden cursor-pointer"
              onClick={() => onSelectPodcast(item.youtubeId, item.difficulty)}
            >
              {/* Top Row: Thumbnail + Info */}
              <div className="flex items-start gap-3">
                <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-border/70">
                  <Image
                    src={
                      item.thumbnailUrl ||
                      `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
                    }
                    alt={item.title || 'Podcast'}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5 text-brand" />
                    <span>Câu {currentSentenceNum}</span>
                  </span>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        item.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : item.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {item.difficulty === 'easy'
                        ? 'Dễ (Từ)'
                        : item.difficulty === 'medium'
                        ? 'Vừa (Cụm)'
                        : 'Khó (Cả câu)'}
                    </span>

                    {item.isFinished && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Xong</span>
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-2 leading-snug"
                    title={item.title}
                  >
                    {item.title || 'Bài luyện nghe YouTube'}
                  </h3>

                  <p className="text-[11px] text-text-secondary truncate">
                    {item.channelName || 'YouTube Creator'}
                  </p>
                </div>
              </div>

              {/* Bottom: Progress Bar + Action */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-secondary font-medium">
                    {item.isFinished
                      ? 'Đã hoàn thành toàn bài'
                      : `Đã làm ${completedCount}/${total} câu`}
                  </span>
                  <span className="text-text-primary font-mono font-bold">{percent}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-base overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.isFinished
                        ? 'bg-emerald-500'
                        : percent > 50
                        ? 'bg-brand'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
                    <PlayCircle className="w-4 h-4" />
                    <span>Học tiếp</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
