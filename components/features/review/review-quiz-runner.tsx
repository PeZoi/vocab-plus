'use client';

import React from 'react';
import type { CardWithProgress } from '@/types/card.types';
import type {
  QuizSessionStats,
  ReviewCardItem,
} from '@/types/review.types';
import { useQuizRunner } from '@/hooks/features/review/use-quiz-runner';
import { QuizLevelUpOverlay } from './quiz-level-up-overlay';
import { QuizHeader } from './quiz-header';
import { QuizQuestionCard } from './quiz-question-card';

interface ReviewQuizRunnerProps {
  reviewCards: ReviewCardItem[];
  allCards?: CardWithProgress[];
  isCustomSession?: boolean;
  onComplete: (stats: QuizSessionStats) => void;
  onExit: () => void;
}

export function ReviewQuizRunner({
  reviewCards,
  allCards = [],
  isCustomSession = false,
  onComplete,
  onExit,
}: ReviewQuizRunnerProps) {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    progressPercent,
    isRanked,
    isRetestMode,
    selectedOptionId,
    isAnswered,
    levelUpPopup,
    handleSelectOption,
  } = useQuizRunner({
    reviewCards,
    allCards,
    isCustomSession,
    onComplete,
  });

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 py-2">
      {/* Level Up Celebration Popup Overlay */}
      <QuizLevelUpOverlay levelUpPopup={levelUpPopup} />

      {/* Top Header: Exit, Mode Indicator & Progress */}
      <QuizHeader
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        progressPercent={progressPercent}
        isRanked={isRanked}
        isRetestMode={isRetestMode}
        onExit={onExit}
      />

      {/* Question Card Panel */}
      <QuizQuestionCard
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        isAnswered={isAnswered}
        onSelectOption={handleSelectOption}
      />
    </div>
  );
}
