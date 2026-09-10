'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/common/empty-state';
import {
  MixedPracticeRunner,
  type LevelUpItem,
} from '@/components/features/practice/mixed-practice-runner';
import { PracticeSetup } from '@/components/features/practice/practice-setup';
import { PracticeSummary } from '@/components/features/practice/practice-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { userKeys, reviewKeys, questKeys, cardKeys } from '@/constants/query-keys';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { practiceService } from '@/services/practice.service';
import type { CardWithProgress } from '@/types/card.types';
import type { PracticeQuestionItem, PracticeSourceType } from '@/types/practice.types';
import { createRandomMixedQuestions } from '@/utils/practice-generator';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';

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
  levelUps?: LevelUpItem[];
}

function PracticeContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const cardIdsParam = searchParams.get('card_ids');
  const modeParam = searchParams.get('mode');

  const { data: cards = [], isLoading, isError } = useCardsQuery();
  const [status, setStatus] = useState<PracticeStatus>('setup');
  const [sessionConfig, setSessionConfig] = useState<ActiveSessionConfig | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResultStats | null>(null);

  const autoStartProcessed = useRef(false);

  const handleStart = (config: ActiveSessionConfig) => {
    setSessionConfig(config);
    setStatus('practicing');
  };

  // Tự động kích hoạt bài kiểm tra nếu có query params (ví dụ chuyển từ màn Flashcard Review hoặc fast-track mode)
  useEffect(() => {
    if (isLoading || cards.length === 0 || autoStartProcessed.current || status !== 'setup') {
      return;
    }

    if (cardIdsParam) {
      autoStartProcessed.current = true;
      const targetIds = cardIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const pickedCards = cards.filter((c) => targetIds.includes(c.id));
      if (pickedCards.length > 0) {
        const questions = createRandomMixedQuestions(pickedCards);
        handleStart({
          sourceType: 'all',
          collectionTitle: 'Từ vựng vừa xem Flashcard',
          selectedCards: pickedCards,
          questions,
          questionCount: questions.length,
        });
      }
    } else if (modeParam === 'due') {
      autoStartProcessed.current = true;
      const now = Date.now();
      const dueCards = cards.filter((c) => {
        if (!c.user_card || c.user_card.state === 'new') return true;
        if (!c.user_card.due_at) return true;
        return new Date(c.user_card.due_at).getTime() <= now + 60 * 1000;
      });

      if (dueCards.length > 0) {
        const pickedCards = dueCards.slice(0, Math.min(20, dueCards.length));
        const questions = createRandomMixedQuestions(pickedCards);
        handleStart({
          sourceType: 'all',
          collectionTitle: 'Từ vựng đến hạn FSRS',
          selectedCards: pickedCards,
          questions,
          questionCount: questions.length,
        });
      }
    }
  }, [cardIdsParam, modeParam, cards, isLoading, status]);

  const handleComplete = async (stats: SessionResultStats) => {
    try {
      // Gọi API tổng kết và cập nhật XP một lần duy nhất vào database (đồng thời ghi nhận Streak & Quest progress)
      const res = await practiceService.completeSession({
        xp_earned: stats.xpEarned,
        total_questions: stats.total,
        correct_count: stats.correct,
        mode: 'mixed',
        collection_title: sessionConfig?.collectionTitle,
      });

      // Cập nhật toàn bộ cache liên quan: cards, header XP/streak, daily quests và profile
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cardKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: questKeys.daily() }),
      ]);

      setSessionResult({
        ...stats,
        xpEarned: res.actual_xp_awarded ?? stats.xpEarned,
      });
    } catch (err) {
      console.error('Lỗi cập nhật XP kiểm tra:', err);
      setSessionResult(stats);
    }

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
          levelUps={sessionResult.levelUps}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto space-y-6 py-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
