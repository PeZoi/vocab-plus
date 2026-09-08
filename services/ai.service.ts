import { apiClient } from '@/lib/axios';
import type { AIWordAnalysisResponse } from '@/types/card.types';
import type { GenerateStoryRequest, GenerateStoryResponse } from '@/types/imported-text.types';
import type { SentenceGradeRequest, SentenceGradeResponse } from '@/types/practice.types';

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

  /**
   * Gọi AI tạo câu chuyện theo trình độ CEFR, chủ đề, thể loại và từ vựng mục tiêu
   */
  generateStory: (payload: GenerateStoryRequest): Promise<GenerateStoryResponse> => {
    return apiClient.post('/ai/generate-story', payload, {
      timeout: 90000,
    });
  },

  /**
   * Gọi AI chấm điểm và nhận xét câu tự viết
   */
  gradeSentence: (payload: SentenceGradeRequest): Promise<SentenceGradeResponse> => {
    return apiClient.post('/ai/grade-sentence', payload, {
      timeout: 60000,
    });
  },
};

