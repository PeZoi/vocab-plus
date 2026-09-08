import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import type { SentenceGradeRequest, SentenceGradeResponse } from '@/types/practice.types';

export function useGradeSentence() {
  return useMutation<SentenceGradeResponse, Error, SentenceGradeRequest>({
    mutationFn: (payload) => aiService.gradeSentence(payload),
  });
}
