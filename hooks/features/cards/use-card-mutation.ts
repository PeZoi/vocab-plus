'use client';

import { cardKeys, reviewKeys } from '@/constants/query-keys';
import { cardsService } from '@/services/cards.service';
import type { CreateCardDto, UpdateCardDto } from '@/types/card.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCardDto) => cardsService.createCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
}

export function useUpdateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCardDto }) =>
      cardsService.updateCard(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
}

export function useDeleteCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cardsService.deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
}

export function useBulkDeleteCardsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardIds: string[]) => cardsService.bulkDeleteCards(cardIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
  });
}
