'use client';

import { cardKeys } from '@/constants/query-keys';
import { cardsService } from '@/services/cards.service';
import type { CardFilterParams } from '@/types/card.types';
import { useQuery } from '@tanstack/react-query';

export function useCardsQuery(params?: CardFilterParams) {
  return useQuery({
    queryKey: cardKeys.list(params as Record<string, unknown> | undefined),
    queryFn: () => cardsService.getCards(params),
  });
}

export function useCardDetailQuery(id?: string) {
  return useQuery({
    queryKey: cardKeys.detail(id || ''),
    queryFn: () => cardsService.getCardById(id!),
    enabled: !!id,
  });
}
