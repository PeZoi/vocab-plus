'use client';

import { cardKeys, reviewKeys } from '@/constants/query-keys';
import { reviewService } from '@/services/review.service';
import type { ReviewRating } from '@/types/review.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);
  const cardStartTimeRef = useRef<number>(0);

  // Khởi tạo thời gian khi bắt đầu phiên
  useEffect(() => {
    cardStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const submitMutation = useMutation({
    mutationFn: reviewService.submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (submitMutation.isPending || dueCards.length === 0) return;

      const currentItem = dueCards[currentIndex];
      if (!currentItem) return;

      const now = Date.now();
      const responseMs = cardStartTimeRef.current > 0 ? now - cardStartTimeRef.current : 1000;

      try {
        await submitMutation.mutateAsync({
          card_id: currentItem.card.id,
          rating,
          response_ms: responseMs,
        });

        setCardsReviewedCount((prev) => prev + 1);

        if (currentIndex + 1 < dueCards.length) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev + 1);
          cardStartTimeRef.current = Date.now();
        } else {
          setSessionCompleted(true);
          queryClient.invalidateQueries({ queryKey: cardKeys.due() });
        }
      } catch (err) {
        console.error('Lỗi gửi kết quả review:', err);
      }
    },
    [currentIndex, dueCards, submitMutation, queryClient]
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
    isSubmitting: submitMutation.isPending,
    sessionCompleted,
    cardsReviewedCount,
    error,
    refetch,
  };
}
