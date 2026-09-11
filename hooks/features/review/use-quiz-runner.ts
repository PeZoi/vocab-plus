'use client';

import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import { reviewService } from '@/services/review.service';
import type { CardWithProgress, UserCard } from '@/types/card.types';
import type {
  LevelChangeResult,
  QuizOptionItem,
  QuizQuestionItem,
  QuizSessionStats,
  ReviewCardItem,
} from '@/types/review.types';
import {
  DEFAULT_VOCAB_LEVEL_SETTINGS,
  type VocabLevelSettings,
} from '@/types/system-settings.types';
import {
  calculateWordLevel,
  mapQuizResultToFSRS,
} from '@/utils/fsrs-level';
import { generateQuizQuestions } from '@/utils/quiz-distractors';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseQuizRunnerProps {
  reviewCards: ReviewCardItem[];
  allCards?: CardWithProgress[];
  isCustomSession?: boolean;
  onComplete: (stats: QuizSessionStats) => void;
}

export function useQuizRunner({
  reviewCards,
  allCards = [],
  isCustomSession = false,
  onComplete,
}: UseQuizRunnerProps) {
  const { data: systemSettings = [] } = useSystemSettingsQuery();

  const levelConfig = useMemo<VocabLevelSettings>(() => {
    const setting = systemSettings.find((s) => s.key === 'vocab_level_config');
    if (setting?.value && typeof setting.value === 'object') {
      const val = setting.value as Partial<VocabLevelSettings>;
      if (Array.isArray(val.levels) && val.levels.length > 0) {
        return {
          penaltyRule: val.penaltyRule || DEFAULT_VOCAB_LEVEL_SETTINGS.penaltyRule,
          allowLevelUpInCasualMode: !!val.allowLevelUpInCasualMode,
          levels: val.levels,
        };
      }
    }
    return DEFAULT_VOCAB_LEVEL_SETTINGS;
  }, [systemSettings]);

  // Sinh danh sách câu hỏi ban đầu
  const initialQuestions = useMemo(() => {
    return generateQuizQuestions(reviewCards, allCards, isCustomSession);
  }, [reviewCards, allCards, isCustomSession]);

  const [questionQueue, setQuestionQueue] = useState<QuizQuestionItem[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);
  const [retestQueue, setRetestQueue] = useState<QuizQuestionItem[]>([]);

  // Ref lưu giữ chính xác thống kê, tránh stale closure khi setTimeout gọi
  const statsRef = useRef<{
    correctCount: number;
    wrongCount: number;
    xpEarned: number;
    levelUps: LevelChangeResult[];
    levelDowns: LevelChangeResult[];
  }>({
    correctCount: 0,
    wrongCount: 0,
    xpEarned: 0,
    levelUps: [],
    levelDowns: [],
  });

  // Lưu danh sách pending HTTP submit review để await trước khi kết thúc
  const pendingSubmitsRef = useRef<Promise<unknown>[]>([]);

  // Banner hiệu ứng Level Up
  const [levelUpPopup, setLevelUpPopup] = useState<LevelChangeResult | null>(null);

  // Ghi nhận thời gian bắt đầu câu hỏi
  const questionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, []);

  const currentQuestion = questionQueue[currentIndex] || null;
  const isRanked = currentQuestion?.isRanked ?? false;
  const totalQuestions = questionQueue.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex) / totalQuestions) * 100) : 0;

  const handleNextQuestion = useCallback(async () => {
    questionStartTimeRef.current = Date.now();
    setSelectedOptionId(null);
    setIsAnswered(false);

    if (currentIndex + 1 < questionQueue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Hết danh sách câu hỏi chính: Kiểm tra xem có câu nào cần làm lại không
      if (retestQueue.length > 0 && !isRetestMode) {
        setIsRetestMode(true);
        setQuestionQueue(retestQueue);
        setRetestQueue([]);
        setCurrentIndex(0);
      } else {
        // Đợi tất cả API submit review hoàn thành xong trước khi báo onComplete
        if (pendingSubmitsRef.current.length > 0) {
          await Promise.allSettled(pendingSubmitsRef.current);
        }

        // Hoàn thành toàn bộ phiên Quiz!
        onComplete({
          totalQuestions: initialQuestions.length,
          correctCount: statsRef.current.correctCount,
          wrongCount: statsRef.current.wrongCount,
          xpEarned: statsRef.current.xpEarned,
          levelUps: statsRef.current.levelUps,
          levelDowns: statsRef.current.levelDowns,
          isRanked: !isCustomSession,
        });
      }
    }
  }, [
    currentIndex,
    questionQueue.length,
    retestQueue,
    isRetestMode,
    onComplete,
    initialQuestions.length,
    isCustomSession,
  ]);

  const handleNextQuestionRef = useRef(handleNextQuestion);
  useEffect(() => {
    handleNextQuestionRef.current = handleNextQuestion;
  });

  // Xử lý khi người dùng chọn đáp án
  const handleSelectOption = useCallback(
    async (option: QuizOptionItem) => {
      if (isAnswered || !currentQuestion) return;

      setIsAnswered(true);
      setSelectedOptionId(option.id);

      const now = Date.now();
      const responseTimeMs = Math.max(500, now - questionStartTimeRef.current);
      const isCorrect = option.isCorrect;
      const card = currentQuestion.cardItem.card;
      const userCard = currentQuestion.cardItem.user_card;

      if (isCorrect) {
        // Đúng: Cộng XP
        const earned = isRetestMode ? 2 : 10;
        statsRef.current.correctCount += 1;
        statsRef.current.xpEarned += earned;

        // Nếu là phiên Ranked và chưa phải câu làm lại (re-test):
        if (isRanked && !isRetestMode) {
          const oldLevelInfo = calculateWordLevel(userCard, levelConfig);
          const simulatedUserCard: UserCard = {
            id: userCard?.id || 'mock',
            card_id: card.id,
            user_id: userCard?.user_id || 'mock',
            stability: (Number(userCard?.stability) || 0) + 3,
            difficulty: userCard?.difficulty || 5,
            due_at: new Date(Date.now() + 86400000 * 3).toISOString(),
            review_count: (Number(userCard?.review_count) || 0) + 1,
            lapse_count: Number(userCard?.lapse_count) || 0,
            is_leech: false,
            state: 'review',
          };
          const newLevelInfo = calculateWordLevel(simulatedUserCard, levelConfig);

          if (newLevelInfo.level > oldLevelInfo.level) {
            const upResult: LevelChangeResult = {
              cardId: card.id,
              word: card.word,
              oldLevel: oldLevelInfo.level,
              newLevel: newLevelInfo.level,
              direction: 'up',
            };
            statsRef.current.levelUps.push(upResult);
            setLevelUpPopup(upResult);
            setTimeout(() => setLevelUpPopup(null), 2500);
          }

          // Gọi API submit review ngầm và lưu Promise vào pendingSubmitsRef
          const rating = mapQuizResultToFSRS(true, responseTimeMs);
          const submitPromise = reviewService.submitReview({
            card_id: card.id,
            rating,
            response_ms: responseTimeMs,
          }).catch((err) => console.error('Lỗi submit review:', err));
          pendingSubmitsRef.current.push(submitPromise);
        }
      } else {
        // Sai: Ghi nhận sai
        statsRef.current.wrongCount += 1;

        if (isRanked && !isRetestMode) {
          const oldLevelInfo = calculateWordLevel(userCard, levelConfig);
          const penaltyRule = levelConfig.penaltyRule;
          const newLevelVal =
            penaltyRule === 'drop_to_zero'
              ? 0
              : Math.max(0, oldLevelInfo.level - 1);

          const isLvl5Protected = oldLevelInfo.level === 5 && (userCard?.lapse_count || 0) === 0;

          if (!isLvl5Protected && newLevelVal < oldLevelInfo.level) {
            const downResult: LevelChangeResult = {
              cardId: card.id,
              word: card.word,
              oldLevel: oldLevelInfo.level,
              newLevel: newLevelVal,
              direction: 'down',
            };
            statsRef.current.levelDowns.push(downResult);
          }

          // Gọi API submit FSRS Rating.Again (1) và lưu Promise
          const submitPromise = reviewService.submitReview({
            card_id: card.id,
            rating: 1,
            response_ms: responseTimeMs,
          }).catch((err) => console.error('Lỗi submit review sai:', err));
          pendingSubmitsRef.current.push(submitPromise);
        }

        // Đưa câu hỏi này vào hàng đợi làm lại (Re-test queue) ở cuối bài
        if (!isRetestMode) {
          setRetestQueue((prev) => [...prev, currentQuestion]);
        }
      }

      // Tự động chuyển câu sau 1.2s qua ref mới nhất
      setTimeout(() => {
        handleNextQuestionRef.current();
      }, 1200);
    },
    [isAnswered, currentQuestion, isRetestMode, isRanked, levelConfig]
  );

  return {
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
  };
}
