'use client';

import { CustomStudyModal } from '@/components/features/review/custom-study-modal';
import { Flashcard } from '@/components/features/review/flashcard';
import { RatingActions } from '@/components/features/review/rating-actions';
import { ReviewCompletionScreen } from '@/components/features/review/review-completion-screen';
import { ReviewSyncingScreen } from '@/components/features/review/review-syncing-screen';
import { ReviewEmptyState } from '@/components/features/review/review-empty-state';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useReviewSession } from '@/hooks/features/review/use-review-session';
import { ArrowLeft, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReviewLoading from './loading';

function ReviewSessionContent() {
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection_id') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const cefrLevel = searchParams.get('cefr_level') || undefined;
  const cardIds = searchParams.get('card_ids') || undefined;

  const isCustomSession = !!(collectionId || tag || cefrLevel || cardIds);
  const [isCustomStudyOpen, setIsCustomStudyOpen] = useState(false);

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
    isSyncingFinal,
    sessionCompleted,
    cardsReviewedCount,
    totalXpEarned,
  } = useReviewSession({
    collection_id: collectionId,
    tag,
    cefr_level: cefrLevel,
    card_ids: cardIds,
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

  // Trạng thái hệ thống đang tính toán kết quả ở thẻ cuối
  if (isSyncingFinal) {
    return <ReviewSyncingScreen />;
  }

  // Màn hình hoàn thành phiên học
  if (sessionCompleted) {
    return (
      <ReviewCompletionScreen
        cardsReviewedCount={cardsReviewedCount}
        isCustomSession={isCustomSession}
        collectionId={collectionId}
        totalXpEarned={totalXpEarned}
      />
    );
  }

  // Không có thẻ nào cần ôn hôm nay
  if (!currentItem || totalCards === 0) {
    return (
      <>
        <ReviewEmptyState
          isCustomSession={isCustomSession}
          onOpenCustomStudy={() => setIsCustomStudyOpen(true)}
        />
        <CustomStudyModal
          isOpen={isCustomStudyOpen}
          onClose={() => setIsCustomStudyOpen(false)}
        />
      </>
    );
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
                {collectionId
                  ? 'Đang ôn tập bộ từ vựng đã chọn'
                  : tag
                  ? `Đang ôn tập tag: #${tag}`
                  : cefrLevel
                  ? `Đang ôn tập cấp độ: ${cefrLevel}`
                  : cardIds
                  ? `Đang ôn tập nhóm ${cardIds.split(',').length} từ đã chọn`
                  : 'Đang ôn tập tùy chỉnh'}
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

        {/* Action: Custom Study Modal Launcher */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCustomStudyOpen(true)}
          className="h-7 px-2 text-[11px] gap-1 text-text-secondary hover:text-brand border-border/70"
          title="Tạo phiên ôn tập tùy chỉnh theo Tag, CEFR hoặc Bộ sưu tập"
        >
          <Target className="w-3 h-3 text-brand" />
          <span className="hidden sm:inline">Học tùy chỉnh</span>
        </Button>
      </div>

      {/* Card Counter */}
      <div className="text-center">
        <span className="text-xs font-mono text-text-secondary">
          Thẻ {currentIndex + 1} / {totalCards}
        </span>
      </div>

      {/* 3D Flashcard with instant slide transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.card.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Flashcard
            card={currentItem.card}
            isFlipped={isFlipped}
            onFlip={flipCard}
          />
        </motion.div>
      </AnimatePresence>

      {/* Action Controls */}
      <div className="pt-2">
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

      <CustomStudyModal
        isOpen={isCustomStudyOpen}
        onClose={() => setIsCustomStudyOpen(false)}
      />
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
