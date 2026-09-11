/* eslint-disable react-hooks/set-state-in-effect */
import { cardKeys, reviewKeys, userKeys } from '@/constants/query-keys';
import { reviewService } from '@/services/review.service';
import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import {
  DEFAULT_REVIEW_XP_RATES,
  type ReviewXpRates,
} from '@/types/system-settings.types';
import type { ReviewPhase } from '@/types/review.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useReviewSession(params?: {
  collection_id?: string;
  tag?: string;
  cefr_level?: string;
  card_ids?: string;
}) {
  const queryClient = useQueryClient();

  const {
    data: dueCards = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...cardKeys.due(), params],
    queryFn: () => reviewService.getDueCards(params),
  });

  // Lấy cấu hình điểm review từ system_settings
  const { data: systemSettings = [] } = useSystemSettingsQuery();
  const reviewXpRates = useMemo<ReviewXpRates>(() => {
    const setting = systemSettings.find((s) => s.key === 'review_xp_rates');
    if (setting?.value && typeof setting.value === 'object') {
      return { ...DEFAULT_REVIEW_XP_RATES, ...(setting.value as Partial<ReviewXpRates>) };
    }
    return DEFAULT_REVIEW_XP_RATES;
  }, [systemSettings]);

  const [phase, setPhase] = useState<ReviewPhase>('warmup');
  const [customCardList, setCustomCardList] = useState<typeof dueCards | null>(null);
  const [autoPronounceEnabled, setAutoPronounceEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSyncingFinal, setIsSyncingFinal] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [reviewedCardsCount, setReviewedCardsCount] = useState(0);
  const startTimeRef = useRef<number>(0);

  const activeCards = customCardList || dueCards;

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Ghi nhớ số lượng thẻ của phiên học (không bị reset về 0 khi queryClient invalidate dueCards)
  useEffect(() => {
    if (activeCards.length > 0) {
      setReviewedCardsCount(activeCards.length);
    }
  }, [activeCards.length]);

  const startSession = useCallback(
    (config: { cardLimit: number; shuffleCards: boolean; autoPronounce: boolean }) => {
      let list = [...dueCards].slice(0, config.cardLimit);
      if (config.shuffleCards) {
        list = list.sort(() => 0.5 - Math.random());
      }
      setCustomCardList(list);
      setCurrentIndex(0);
      setIsFlipped(false);
      setAutoPronounceEnabled(config.autoPronounce);
      setReviewedCardsCount(list.length);
      setPhase('preview');
    },
    [dueCards]
  );

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (currentIndex + 1 < activeCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, activeCards.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < activeCards.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [activeCards.length]);

  const finishPreview = useCallback(async () => {
    setIsSyncingFinal(true);

    const sessionCardsCount = reviewedCardsCount || activeCards.length;
    // Thưởng XP theo cấu hình hệ thống (review_xp_rates.per_card) cho mỗi thẻ đã lướt xem
    const xpPerCard = Math.max(0, Number(reviewXpRates.per_card) ?? 1);
    const previewXp = sessionCardsCount * xpPerCard;

    try {
      const completeRes = await reviewService.completeSession({
        total_xp: previewXp,
        cards_reviewed: sessionCardsCount,
        is_preview_only: true, // KHÔNG cập nhật streak khi chỉ lướt flashcard
      });
      setTotalXpEarned(completeRes.actual_xp_awarded ?? previewXp);
    } catch (completeErr) {
      console.error('Lỗi khi gọi complete preview session:', completeErr);
      setTotalXpEarned(previewXp);
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.stats() }),
      ]);
      setIsSyncingFinal(false);
      setPhase('completed');
    }
  }, [activeCards.length, queryClient, reviewedCardsCount, reviewXpRates]);

  const restartReview = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setTotalXpEarned(0);
    setPhase('preview');
  }, []);

  const currentItem = activeCards[currentIndex] || null;
  const totalCards = activeCards.length;
  const progressPercent = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return {
    phase,
    dueCards: activeCards,
    rawDueCards: dueCards,
    currentItem,
    currentIndex,
    totalCards,
    reviewedCardsCount: reviewedCardsCount || totalCards,
    progressPercent,
    isFlipped,
    flipCard,
    nextCard,
    prevCard,
    goToCard,
    finishPreview,
    restartReview,
    startSession,
    autoPronounceEnabled,
    isLoading,
    isSyncingFinal,
    totalXpEarned,
    error,
    refetch,
  };
}
