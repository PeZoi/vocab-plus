import { apiClient } from '@/lib/axios';
import type { AIWordAnalysisResponse } from '@/types/card.types';

export const aiService = {
  /**
   * Gọi AI phân tích từ vựng (từ loại, nghĩa đa chiều, ví dụ, mnemonic)
   */
  analyzeWord: (word: string, context_sentence?: string): Promise<AIWordAnalysisResponse> => {
    return apiClient.post(
      '/ai/analyze-word',
      { word, context_sentence },
      {
        timeout: 90000, // 90 giây để đáp ứng tối đa 10 lần thử lại khi gặp 429 từ Groq
      }
    );
  },
};
