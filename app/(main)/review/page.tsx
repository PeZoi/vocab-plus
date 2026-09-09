'use client';

import { CustomStudyModal } from '@/components/features/review/custom-study-modal';
import { Flashcard } from '@/components/features/review/flashcard';
import { ReviewPreviewControls } from '@/components/features/review/review-preview-controls';
import { ReviewQuizRunner } from '@/components/features/review/review-quiz-runner';
import { ReviewCompletionScreen } from '@/components/features/review/review-completion-screen';
import { ReviewSyncingScreen } from '@/components/features/review/review-syncing-screen';
import { ReviewEmptyState } from '@/components/features/review/review-empty-state';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useReviewSession } from '@/hooks/features/review/use-review-session';
import { ArrowLeft, Target, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReviewLoading from './loading';

function ReviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collection_id') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const cefrLevel = searchParams.get('cefr_level') || undefined;
  const cardIds = searchParams.get('card_ids') || undefined;

  const isCustomSession = !!(collectionId || tag || cefrLevel || cardIds);
  const [isCustomStudyOpen, setIsCustomStudyOpen] = useState(false);

  const {
    phase,
    dueCards,
    currentItem,
    currentIndex,
    totalCards,
    progressPercent,
    isFlipped,
    flipCard,
    nextCard,
    prevCard,
    startQuiz,
    handleQuizComplete,
    restartReview,
    isLoading,
    isSyncingFinal,
    quizStats,
    totalXpEarned,
  } = useReviewSession({
    collection_id: collectionId,
    tag,
    cefr_level: cefrLevel,
    card_ids: cardIds,
  });

  if (isLoading) {
    return <ReviewLoading />;
  }

  // Trạng thái hệ thống đang tính toán kết quả đồng bộ dữ liệu
  if (isSyncingFinal) {
    return <ReviewSyncingScreen />;
  }

  // Màn hình hoàn thành phiên học (sau bài Quiz)
  if (phase === 'completed') {
    return (
      <ReviewCompletionScreen
        cardsReviewedCount={totalCards}
        isCustomSession={isCustomSession}
        collectionId={collectionId}
        totalXpEarned={totalXpEarned}
        quizStats={quizStats}
        onRestartReview={restartReview}
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

  // GIAI ĐOẠN 2: KIỂM TRA TRÍ NHỚ TRẮC NGHIỆM (ACTIVE RECALL QUIZ)
  if (phase === 'quiz') {
    return (
      <ReviewQuizRunner
        reviewCards={dueCards}
        isCustomSession={isCustomSession}
        onComplete={handleQuizComplete}
        onExit={() => {
          if (confirm('Bạn có chắc muốn tạm dừng bài kiểm tra? Tiến trình hiện tại sẽ chưa được lưu.')) {
            router.push(ROUTES.APP.DASHBOARD);
          }
        }}
      />
    );
  }

  // GIAI ĐOẠN 1: LƯỚT XEM TRƯỚC FLASHCARD (PREVIEW PHASE)
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

        {/* Phase Indicator Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] font-medium text-text-secondary">
          <Eye className="w-3.5 h-3.5 text-brand" />
          <span>Giai đoạn 1: Xem trước thẻ</span>
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

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-surface border border-border/80 overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
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

      {/* Preview Navigation & Start Quiz Action Controls */}
      <ReviewPreviewControls
        currentIndex={currentIndex}
        totalCards={totalCards}
        isFlipped={isFlipped}
        onFlip={flipCard}
        onPrev={prevCard}
        onNext={nextCard}
        onStartQuiz={startQuiz}
      />

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
