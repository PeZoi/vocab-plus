/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/common/empty-state';
import { MixedPracticeRunner } from '@/components/features/practice/mixed-practice-runner';
import { PracticeProcessing } from '@/components/features/practice/practice-processing';
import { PracticeSetup } from '@/components/features/practice/practice-setup';
import { PracticeSummary } from '@/components/features/practice/practice-summary';
import { StreakActivatedPopup } from '@/components/features/practice/streak-activated-popup';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { userKeys, reviewKeys, questKeys, cardKeys } from '@/constants/query-keys';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { cardsService } from '@/services/cards.service';
import { practiceService } from '@/services/practice.service';
import type { CardWithProgress } from '@/types/card.types';
import type {
  LevelUpItem,
  PracticeQuestionItem,
  PracticeSourceType,
  WateredCardItem,
} from '@/types/practice.types';
import { createRandomMixedQuestions } from '@/utils/practice-generator';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, GraduationCap, Loader2 } from 'lucide-react';

type PracticeStatus = 'setup' | 'practicing' | 'processing' | 'summary';

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
  wateredCards?: WateredCardItem[];
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
  const [streakPopupState, setStreakPopupState] = useState<{
    isOpen: boolean;
    count: number;
  }>({ isOpen: false, count: 1 });

  const autoStartProcessed = useRef(false);

  const handleStart = (config: ActiveSessionConfig) => {
    setSessionConfig(config);
    setStatus('practicing');
  };

  // Tự động kích hoạt bài kiểm tra nếu có query params (chuyển từ Flashcard Review hoặc fast-track FSRS)
  useEffect(() => {
    if (autoStartProcessed.current || status !== 'setup') {
      return;
    }

    if (cardIdsParam) {
      const targetIds = cardIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (targetIds.length === 0) return;

      // Kiểm tra xem các thẻ đã có trong cache chưa
      const pickedCards = cards.filter((c) => targetIds.includes(c.id));

      if (pickedCards.length === targetIds.length && pickedCards.length > 0) {
        autoStartProcessed.current = true;
        const questions = createRandomMixedQuestions(pickedCards);
        handleStart({
          sourceType: 'all',
          collectionTitle: 'Từ vựng vừa xem Flashcard',
          selectedCards: pickedCards,
          questions,
          questionCount: questions.length,
        });
      } else if (!isLoading) {
        // Nếu trong cache TanStack Query chưa kịp có thẻ (ví dụ thẻ vừa tạo mới), fetch trực tiếp
        autoStartProcessed.current = true;
        (async () => {
          try {
            const fetched = await Promise.all(
              targetIds.map((id) => cardsService.getCardById(id).catch(() => null))
            );
            const validFetched = fetched.filter((c): c is CardWithProgress => c !== null);
            if (validFetched.length > 0) {
              const questions = createRandomMixedQuestions(validFetched);
              handleStart({
                sourceType: 'all',
                collectionTitle: 'Từ vựng vừa xem Flashcard',
                selectedCards: validFetched,
                questions,
                questionCount: questions.length,
              });
            }
          } catch (err) {
            console.error('Lỗi nạp danh sách từ kiểm tra:', err);
          }
        })();
      }
    } else if (modeParam === 'due' && !isLoading && cards.length > 0) {
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
          collectionTitle: 'Từ vựng đến hạn',
          selectedCards: pickedCards,
          questions,
          questionCount: questions.length,
        });
      }
    }
  }, [cardIdsParam, modeParam, cards, isLoading, status]);

  const handleComplete = async (stats: SessionResultStats) => {
    setStatus('processing');
    const startTime = Date.now();

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

      // Đảm bảo thời gian hiển thị chuyển tiếp tối thiểu 1.2s để animation mượt mà
      const elapsed = Date.now() - startTime;
      if (elapsed < 1200) {
        await new Promise((resolve) => setTimeout(resolve, 1200 - elapsed));
      }

      setSessionResult({
        ...stats,
        xpEarned: res.actual_xp_awarded ?? stats.xpEarned,
      });

      // Nếu bài kiểm tra kích hoạt chuỗi streak cho ngày hôm nay, bật popup chúc mừng siêu ngầu
      if (res.streak_activated) {
        setStreakPopupState({
          isOpen: true,
          count: res.streak_count || 1,
        });
      }
    } catch (err) {
      console.error('Lỗi cập nhật XP kiểm tra:', err);
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
      }
      setSessionResult(stats);
    }

    setStatus('summary');
  };

  const handleRestart = () => {
    setStatus('setup');
    setSessionConfig(null);
    setSessionResult(null);
    setStreakPopupState({ isOpen: false, count: 1 });
  };

  const isAutoStarting = !!(cardIdsParam || modeParam) && status === 'setup';

  if (isAutoStarting || (isLoading && !isError)) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto text-brand shadow-lg shadow-brand/10">
          <GraduationCap className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-heading text-text-primary">
            Đang nạp bài kiểm tra tổng hợp...
          </h2>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Hệ thống đang xáo trộn câu hỏi và chuẩn bị phản xạ cho bạn.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-brand font-medium pt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Vào làm bài ngay...</span>
        </div>
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

      {status === 'processing' && (
        <PracticeProcessing />
      )}

      {status === 'summary' && sessionConfig && sessionResult && (
        <>
          <PracticeSummary
            mode="mixed"
            collectionTitle={sessionConfig.collectionTitle}
            totalQuestions={sessionResult.total}
            correctCount={sessionResult.correct}
            wrongCards={sessionResult.wrongCards}
            xpEarned={sessionResult.xpEarned}
            levelUps={sessionResult.levelUps}
            wateredCards={sessionResult.wateredCards}
            onRestart={handleRestart}
          />
          <StreakActivatedPopup
            isOpen={streakPopupState.isOpen}
            streakCount={streakPopupState.count}
            onClose={() => setStreakPopupState((prev) => ({ ...prev, isOpen: false }))}
          />
        </>
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
