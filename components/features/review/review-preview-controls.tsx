'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';

interface ReviewPreviewControlsProps {
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFinishPreview: () => void;
}

export function ReviewPreviewControls({
  currentIndex,
  totalCards,
  isFlipped,
  onFlip,
  onPrev,
  onNext,
  onFinishPreview,
}: ReviewPreviewControlsProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalCards - 1;

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onFlip();
      } else if (e.code === 'ArrowLeft' && !isFirst) {
        e.preventDefault();
        onPrev();
      } else if (e.code === 'ArrowRight' && !isLast) {
        e.preventDefault();
        onNext();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onFinishPreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFlip, onPrev, onNext, onFinishPreview, isFirst, isLast]);

  return (
    <div className="space-y-4 pt-2">
      {/* Primary Card Navigation Bar */}
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Previous Button */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={onPrev}
          disabled={isFirst}
          className="flex-1 max-w-[130px] gap-1.5 text-xs text-text-secondary hover:text-text-primary border-border/80"
          title="Thẻ trước [Phím ←]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trước [←]</span>
          <span className="sm:hidden">Trước</span>
        </Button>

        {/* Center: Flip Card Button */}
        <Button
          type="button"
          variant={isFlipped ? 'surface' : 'primary'}
          size="default"
          onClick={onFlip}
          className="flex-1 max-w-[180px] gap-1.5 text-xs font-semibold shadow-xs"
          title="Lật thẻ xem đáp án [Phím Space]"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Mặt trước' : 'Lật thẻ [Space]'}</span>
        </Button>

        {/* Next Button */}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={onNext}
          disabled={isLast}
          className="flex-1 max-w-[130px] gap-1.5 text-xs text-text-secondary hover:text-text-primary border-border/80"
          title="Thẻ tiếp theo [Phím →]"
        >
          <span className="hidden sm:inline">Sau [→]</span>
          <span className="sm:hidden">Sau</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Finish Preview CTA Button */}
      <div className="text-center pt-1">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onFinishPreview}
          className="w-full max-w-md mx-auto gap-2 bg-gradient-to-r from-brand to-amber-500 hover:from-brand-hover hover:to-amber-600 text-white font-bold shadow-lg shadow-brand/20 h-11 transition-all hover:scale-[1.01]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isLast
              ? `Đã xem hết thẻ! Hoàn thành nạp từ (${totalCards} từ) [Enter]`
              : `Hoàn tất xem thẻ & Chuẩn bị kiểm tra (${totalCards} từ) [Enter]`}
          </span>
        </Button>
        <p className="text-[11px] text-text-secondary mt-1.5">
          💡 Sau khi xem xong thẻ, bạn sẽ chuyển sang làm bài kiểm tra tổng hợp để kích hoạt thăng cấp Level!
        </p>
      </div>
    </div>
  );
}
