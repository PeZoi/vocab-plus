'use client';

import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import type { GenerateStoryRequest, GenerateStoryResponse } from '@/types/imported-text.types';

export function useAiStory() {
  return useMutation<GenerateStoryResponse, Error, GenerateStoryRequest>({
    mutationFn: (payload: GenerateStoryRequest) => aiService.generateStory(payload),
  });
}
