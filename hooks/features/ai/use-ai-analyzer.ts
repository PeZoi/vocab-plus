'use client';

import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import type { AIWordAnalysisResponse } from '@/types/card.types';

export function useAiAnalyzer() {
  return useMutation<
    AIWordAnalysisResponse,
    Error,
    { word: string; context_sentence?: string }
  >({
    mutationFn: ({ word, context_sentence }) =>
      aiService.analyzeWord(word, context_sentence),
  });
}
