'use client';

import { useQuery } from '@tanstack/react-query';
import { cardKeys } from '@/constants/query-keys';
import { cardsService } from '@/services/cards.service';

export function useCardsQuery() {
  return useQuery({
    queryKey: cardKeys.lists(),
    queryFn: () => cardsService.getCards(),
  });
}
