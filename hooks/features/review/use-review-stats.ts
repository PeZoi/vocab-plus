'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewKeys } from '@/constants/query-keys';
import { reviewService } from '@/services/review.service';

export function useReviewStats() {
  return useQuery({
    queryKey: reviewKeys.stats(),
    queryFn: () => reviewService.getStats(),
  });
}
