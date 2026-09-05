'use client';

import { Flashcard } from '@/components/features/review/flashcard';
import { RatingActions } from '@/components/features/review/rating-actions';
import { ReviewCompletionScreen } from '@/components/features/review/review-completion-screen';
import { ReviewEmptyState } from '@/components/features/review/review-empty-state';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useReviewSession } from '@/hooks/features/review/use-review-session';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import ReviewLoading from './loading';

function ReviewSessionContent() {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection_id') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const cefrLevel = searchParams.get('cefr_level') || undefined;

  const isCustomSession = !!(collectionId || tag || cefrLevel);

  const {
    currentItem,
    currentIndex,
    totalCards,
    progressPercent,
    isFlipped,
    flipCard,
    handleRate,
    isLoading,
    isSubmitting,
    sessionCompleted,
    cardsReviewedCount,
  } = useReviewSession({
    collection_id: collectionId,
    tag,
    cefr_level: cefrLevel,
  });

  // Bắt phím Space để lật thẻ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flipCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipCard]);

  if (isLoading) {
    return <ReviewLoading />;
  }

  // Màn hình hoàn thành phiên học
  if (sessionCompleted) {
    return (
      <ReviewCompletionScreen
        cardsReviewedCount={cardsReviewedCount}
        isCustomSession={isCustomSession}
      />
    );
  }

  // Không có thẻ nào cần ôn hôm nay
  if (!currentItem || totalCards === 0) {
    return <ReviewEmptyState isCustomSession={isCustomSession} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Custom Study Session Indicator Banner */}
      {isCustomSession && (
        <div className="p-3 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">🎯</span>
            <div>
              <span className="font-semibold text-brand block">
                Phiên Ôn Tập Tùy Chỉnh (Custom Study Session)
              </span>
              <span className="text-[11px] text-text-secondary">
                {collectionId ? 'Đang ôn tập bộ từ vựng đã chọn' : tag ? `Đang ôn tập tag: ${tag}` : `Đang ôn tập cấp độ: ${cefrLevel}`}
              </span>
            </div>
          </div>
          <Link href={ROUTES.APP.REVIEW}>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-text-secondary hover:text-text-primary">
              Về FSRS mặc định
            </Button>
          </Link>
        </div>
      )}

      {/* Progress Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={collectionId ? ROUTES.APP.COLLECTION_DETAIL(collectionId) : ROUTES.APP.DASHBOARD}
          className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát phiên</span>
        </Link>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xs">
          <div className="w-full h-1.5 rounded-full bg-surface border border-border/80 overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <span className="text-xs font-medium text-text-secondary font-mono">
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Flashcard Component */}
      <Flashcard card={currentItem.card} isFlipped={isFlipped} onFlip={flipCard} />

      {/* Rating Actions (Show when flipped) */}
      <div className="transition-opacity duration-200">
        {isFlipped ? (
          <RatingActions onRate={handleRate} disabled={isSubmitting} />
        ) : (
          <div className="text-center">
            <Button
              variant="primary"
              size="default"
              onClick={flipCard}
              className="w-full max-w-xs gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lật thẻ xem đáp án [Space]</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <ReviewSessionContent />
    </Suspense>
  );
}
