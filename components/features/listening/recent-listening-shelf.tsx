'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  History,
  PlayCircle,
  CheckCircle2,
  Clock,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import type { UserListeningProgressWithMeta, ListeningDifficulty } from '@/types/listening.types';

interface RecentListeningShelfProps {
  historyList: UserListeningProgressWithMeta[];
  onSelectPodcast: (youtubeId: string, difficulty: ListeningDifficulty) => void;
  onDeletePodcast?: (youtubeId: string, difficulty: ListeningDifficulty) => Promise<void> | void;
  onClearAllHistory?: () => Promise<void> | void;
  isLoading?: boolean;
}

export function RecentListeningShelf({
  historyList,
  onSelectPodcast,
  onDeletePodcast,
  onClearAllHistory,
  isLoading = false,
}: RecentListeningShelfProps) {
  const [deleteTarget, setDeleteTarget] = useState<{
    youtubeId: string;
    difficulty: ListeningDifficulty;
    title: string;
  } | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDeletePodcast) return;
    try {
      setIsDeleting(true);
      await onDeletePodcast(deleteTarget.youtubeId, deleteTarget.difficulty);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClearAll = async () => {
    if (!onClearAllHistory) return;
    try {
      setIsDeleting(true);
      await onClearAllHistory();
      setIsClearingAll(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2 animate-pulse">
        {/* Header Skeleton */}
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

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
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
    );
  }

  if (!historyList || historyList.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface border border-border text-text-secondary">
            {historyList.length} bài đã lưu
          </span>

          {onClearAllHistory && historyList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearingAll(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-base hover:bg-red-500/10 hover:border-red-500/30 text-text-secondary hover:text-red-500 border border-border transition-colors cursor-pointer flex items-center gap-1.5"
              title="Xóa toàn bộ bài học đã nghe"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>
          )}
        </div>
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
                  <div className="flex items-center justify-between gap-1.5">
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

                    {/* Nút Xóa nhanh góc phải */}
                    {onDeletePodcast && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({
                            youtubeId: item.youtubeId,
                            difficulty: item.difficulty,
                            title: item.title || 'Bài luyện nghe YouTube',
                          });
                        }}
                        className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1 -mr-1 -mt-0.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                        title="Xóa bài học này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

                <div className="pt-1 flex items-center justify-between">
                  {onDeletePodcast ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({
                          youtubeId: item.youtubeId,
                          difficulty: item.difficulty,
                          title: item.title || 'Bài luyện nghe YouTube',
                        });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
                      title="Xóa bài học này khỏi lịch sử"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  ) : (
                    <div />
                  )}

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

      {/* Modal xác nhận xóa 1 bài */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        maxWidth="sm"
        title="Xác nhận xóa bài học"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Bạn có chắc chắn muốn xóa bài học{' '}
            <strong className="text-text-primary font-semibold">
              &ldquo;{deleteTarget?.title}&rdquo;
            </strong>{' '}
            khỏi danh sách nghe gần đây không? Tiến độ chép chính tả đã lưu của bài này sẽ bị xóa.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa bài học</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận xóa tất cả */}
      <Modal
        isOpen={isClearingAll}
        onClose={() => {
          if (!isDeleting) setIsClearingAll(false);
        }}
        maxWidth="sm"
        title="Xóa toàn bộ lịch sử nghe"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span className="leading-relaxed">
              Hành động này sẽ xóa toàn bộ <strong>{historyList.length} bài học</strong> và tiến độ chép chính tả đã lưu của bạn. Không thể hoàn tác sau khi thực hiện.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsClearingAll(false)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmClearAll}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
