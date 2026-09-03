'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardKeys, reviewKeys } from '@/constants/query-keys';
import { cardsService } from '@/services/cards.service';
import type { CreateCardDto } from '@/types/card.types';

export function useCreateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCardDto) => cardsService.createCard(payload),
    onSuccess: () => {
      // Invalidate toàn bộ query liên quan đến cards và stats
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
}
