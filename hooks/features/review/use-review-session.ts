import { cardKeys, reviewKeys, questKeys, userKeys } from '@/constants/query-keys';
import { reviewService } from '@/services/review.service';
import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import {
  DEFAULT_REVIEW_XP_RATES,
  type ReviewXpRates,
} from '@/types/system-settings.types';
import type { ReviewRating } from '@/types/review.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isSyncingFinal, setIsSyncingFinal] = useState(false);
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const accumulatedXpRef = useRef<number>(0);
  const cardStartTimeRef = useRef<number>(0);

  // Khởi tạo thời gian khi bắt đầu phiên
  useEffect(() => {
    cardStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const submitMutation = useMutation({
    mutationFn: reviewService.submitReview,
  });

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (dueCards.length === 0) return;

      const currentItem = dueCards[currentIndex];
      if (!currentItem) return;

      const now = Date.now();
      const responseMs = cardStartTimeRef.current > 0 ? now - cardStartTimeRef.current : 1000;
      const nextIndex = currentIndex + 1;
      const isLastCard = nextIndex >= dueCards.length;

      // 1. Tích lũy điểm XP của thẻ này theo cấu hình (mỗi flashcard là 1 điểm)
      const xpEarnedThisCard = Number(reviewXpRates.per_card) || 1;
      accumulatedXpRef.current += xpEarnedThisCard;

      // 2. OPTIMISTIC UI: Chuyển ngay sang thẻ kế tiếp trong 0ms nếu chưa phải thẻ cuối
      setCardsReviewedCount((prev) => prev + 1);

      if (!isLastCard) {
        setIsFlipped(false);
        setCurrentIndex(nextIndex);
        cardStartTimeRef.current = Date.now();
      } else {
        // Kích hoạt trạng thái hiển thị màn hình tính toán ở thẻ cuối
        setIsSyncingFinal(true);
      }

      // 3. Gửi mutation ngầm dưới background (non-blocking)
      submitMutation.mutate(
        {
          card_id: currentItem.card.id,
          rating,
          response_ms: responseMs,
        },
        {
          onSuccess: async () => {
            if (isLastCard) {
              const totalSessionXp = accumulatedXpRef.current;
              try {
                const completeRes = await reviewService.completeSession({
                  total_xp: totalSessionXp,
                  cards_reviewed: nextIndex,
                });
                setTotalXpEarned(completeRes.actual_xp_awarded ?? totalSessionXp);
              } catch (completeErr) {
                console.error('Lỗi khi gọi complete review session:', completeErr);
                setTotalXpEarned(totalSessionXp);
              }

              // CHỈ KHI HOÀN THÀNH XONG THẺ CUỐI CÙNG mới làm mới toàn bộ Stats, Quests, Streak và XP
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: reviewKeys.stats() }),
                queryClient.invalidateQueries({ queryKey: questKeys.daily() }),
                queryClient.invalidateQueries({ queryKey: userKeys.profile() }),
                queryClient.invalidateQueries({ queryKey: cardKeys.due() }),
              ]);
              setIsSyncingFinal(false);
              setSessionCompleted(true);
            }
          },
          onError: async (err) => {
            console.error('Lỗi gửi kết quả review:', err);
            if (isLastCard) {
              await queryClient.invalidateQueries({ queryKey: cardKeys.due() });
              setIsSyncingFinal(false);
              setSessionCompleted(true);
            }
          },
        }
      );
    },
    [currentIndex, dueCards, submitMutation, queryClient, reviewXpRates]
  );

  const currentItem = dueCards[currentIndex] || null;
  const totalCards = dueCards.length;
  const progressPercent = totalCards > 0 ? Math.round(((currentIndex) / totalCards) * 100) : 0;

  return {
    currentItem,
    currentIndex,
    totalCards,
    progressPercent,
    isFlipped,
    flipCard,
    handleRate,
    isLoading,
    isSubmitting: submitMutation.isPending && currentIndex >= dueCards.length - 1,
    isSyncingFinal,
    sessionCompleted,
    cardsReviewedCount,
    totalXpEarned,
    error,
    refetch,
  };
}
