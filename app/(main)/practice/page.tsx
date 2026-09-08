'use client';

import { EmptyState } from '@/components/common/empty-state';
import { MixedPracticeRunner } from '@/components/features/practice/mixed-practice-runner';
import { PracticeSetup } from '@/components/features/practice/practice-setup';
import { PracticeSummary } from '@/components/features/practice/practice-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import type { CardWithProgress } from '@/types/card.types';
import type { PracticeQuestionItem, PracticeSourceType } from '@/types/practice.types';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';

type PracticeStatus = 'setup' | 'practicing' | 'summary';

interface ActiveSessionConfig {
  sourceType: PracticeSourceType;
  collectionTitle?: string;
  selectedCards: CardWithProgress[];
  questions: PracticeQuestionItem[];
  questionCount: number;
}

interface SessionResultStats {
  total: number;
  correct: number;
  wrongCards: CardWithProgress[];
  xpEarned: number;
}

export default function PracticePage() {
  const { data: cards = [], isLoading, isError } = useCardsQuery();
  const [status, setStatus] = useState<PracticeStatus>('setup');
  const [sessionConfig, setSessionConfig] = useState<ActiveSessionConfig | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResultStats | null>(null);

  const handleStart = (config: ActiveSessionConfig) => {
    setSessionConfig(config);
    setStatus('practicing');
  };

  const handleComplete = (stats: SessionResultStats) => {
    setSessionResult(stats);
    setStatus('summary');
  };

  const handleRestart = () => {
    setStatus('setup');
    setSessionConfig(null);
    setSessionResult(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-danger text-sm">Không thể tải danh sách từ vựng. Vui lòng tải lại trang.</p>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Tải lại
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <EmptyState
          icon={BookOpen}
          title="Kho từ vựng đang trống"
          description="Bạn cần thêm ít nhất một vài từ vựng vào kho để có thể bắt đầu các bài luyện tập và kiểm tra kiến thức."
          actionText="Thêm từ vựng ngay"
          onAction={() => {
            window.location.href = ROUTES.APP.ADD;
          }}
        />
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-6 px-2 sm:px-4">
      {status === 'setup' && (
        <PracticeSetup cards={cards} onStart={handleStart} />
      )}

      {status === 'practicing' && sessionConfig && (
        <MixedPracticeRunner
          questions={sessionConfig.questions}
          allCards={cards}
          collectionTitle={sessionConfig.collectionTitle}
          onComplete={handleComplete}
          onExit={handleRestart}
        />
      )}

      {status === 'summary' && sessionConfig && sessionResult && (
        <PracticeSummary
          mode="mixed"
          collectionTitle={sessionConfig.collectionTitle}
          totalQuestions={sessionResult.total}
          correctCount={sessionResult.correct}
          wrongCards={sessionResult.wrongCards}
          xpEarned={sessionResult.xpEarned}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
