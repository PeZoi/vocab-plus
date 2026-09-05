'use client';

import { EmptyState } from '@/components/common/empty-state';
import { Flashcard } from '@/components/features/review/flashcard';
import { RatingActions } from '@/components/features/review/rating-actions';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useReviewSession } from '@/hooks/features/review/use-review-session';
import { ArrowLeft, CheckCircle, FolderKanban, Sparkles, Trophy } from 'lucide-react';
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
      <div className="max-w-md mx-auto text-center py-12 px-4 space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto success-glow">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
            Tuyệt vời! Hoàn thành phiên ôn tập!
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            Bạn đã ôn tập xong <span className="font-bold text-brand">{cardsReviewedCount}</span> thẻ
            {isCustomSession ? ' trong phiên ôn tập tùy chỉnh.' : ' theo lịch FSRS hôm nay.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-around text-center">
          <div>
            <span className="text-xs text-text-secondary">Thẻ đã ôn</span>
            <p className="text-xl font-bold text-text-primary">{cardsReviewedCount}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="text-xs text-text-secondary">XP ước tính</span>
            <p className="text-xl font-bold text-brand">+{cardsReviewedCount * 5} XP</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href={ROUTES.APP.DASHBOARD} className="flex-1">
            <Button variant="surface" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về Dashboard
            </Button>
          </Link>
          <Link href={ROUTES.APP.COLLECTIONS} className="flex-1">
            <Button variant="primary" className="w-full">
              <FolderKanban className="w-4 h-4 mr-2" />
              Bộ sưu tập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Không có thẻ nào cần ôn hôm nay
  if (!currentItem || totalCards === 0) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4">
        {isCustomSession && (
          <div className="p-3 rounded-xl bg-surface border border-border/80 text-center text-xs text-text-secondary">
            <span>Phiên học tùy chỉnh này hiện chưa có thẻ nào.</span>
          </div>
        )}
        <EmptyState
          icon={CheckCircle}
          title={isCustomSession ? "Bộ từ hiện chưa có thẻ nào!" : "Không có thẻ nào cần ôn hôm nay!"}
          description={
            isCustomSession
              ? "Bộ sưu tập này chưa có thẻ từ vựng hoặc các thẻ chưa được liên kết."
              : "Bạn đã hoàn thành xuất sắc toàn bộ lịch học FSRS ngày hôm nay. Hãy tiếp tục duy trì chuỗi học tập nhé!"
          }
          actionText={isCustomSession ? "Quay lại Bộ sưu tập" : "Thêm từ vựng mới để học"}
          onAction={() => {
            window.location.href = isCustomSession ? ROUTES.APP.COLLECTIONS : ROUTES.APP.ADD;
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Custom Study Session Indicator Banner */}
      {isCustomSession && (
        <div className="p-3 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
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
