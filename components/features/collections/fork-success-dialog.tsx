'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ROUTES } from '@/constants/routes';
import type { Collection } from '@/types/collection.types';
import { BookOpen, CheckCircle2, GitFork, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ForkSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clonedCollection: Collection | null;
  cardsCount: number;
}

export function ForkSuccessDialog({
  isOpen,
  onClose,
  clonedCollection,
  cardsCount,
}: ForkSuccessDialogProps) {
  const router = useRouter();

  if (!clonedCollection) return null;

  const handleGoToCollection = () => {
    onClose();
    router.push(ROUTES.APP.COLLECTION_DETAIL(clonedCollection.id));
  };

  const handleStartReview = () => {
    onClose();
    router.push(`${ROUTES.APP.REVIEW}?collection_id=${clonedCollection.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      className="p-6 text-center"
    >
      <div className="space-y-5 pt-2">
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-brand/15 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
          <GitFork className="w-8 h-8 text-brand" />
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-base flex items-center justify-center border-2 border-surface shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đã sao chép thành công</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">
            Fork Bộ Sưu Tập Hoàn Tất!
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
            Toàn bộ từ vựng và câu ví dụ đã được đưa vào kho cá nhân của bạn kèm lịch ôn tập.
          </p>
        </div>

        {/* Collection Summary Card */}
        <div className="p-3.5 rounded-xl bg-base/80 border border-border/80 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
              Bộ từ mới
            </span>
            <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
              +{cardsCount} từ vựng
            </span>
          </div>

          <div className="text-sm font-semibold text-text-primary truncate">
            {clonedCollection.title}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary pt-1 border-t border-border/50">
            <BookOpen className="w-3 h-3 text-emerald-400" />
            <span>Sẵn sàng cho các bài kiểm tra & Flashcard</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {cardsCount > 0 && (
            <Button
              type="button"
              onClick={handleStartReview}
              className="w-full h-9 gap-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-white shadow-xs shadow-brand/25"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ôn tập bộ này ngay</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoToCollection}
            className="w-full h-9 gap-1.5 text-xs text-text-primary hover:bg-surface-hover border-border/80"
          >
            <BookOpen className="w-3.5 h-3.5 text-text-secondary" />
            <span>Xem chi tiết bộ từ</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full h-8 text-xs text-text-secondary hover:text-text-primary"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
