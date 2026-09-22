import { apiClient } from '@/lib/axios';
import type {
  GenerateStoryQuizRequest,
  GenerateStoryQuizResponse,
  GradeStoryEssayRequest,
  GradeStoryEssayResponse,
} from '@/types/story-quiz.types';

export const storyQuizService = {
  /**
   * Gọi AI sinh bộ câu hỏi đọc hiểu (trắc nghiệm, tự luận hoặc hỗn hợp)
   */
  generateQuiz: (payload: GenerateStoryQuizRequest): Promise<GenerateStoryQuizResponse> => {
    return apiClient.post('/ai/story-quiz/generate', payload, {
      timeout: 90000,
    });
  },

  /**
   * Gọi AI chấm điểm và nhận xét câu trả lời tự luận đọc hiểu
   */
  gradeEssay: (payload: GradeStoryEssayRequest): Promise<GradeStoryEssayResponse> => {
    return apiClient.post('/ai/story-quiz/grade-essay', payload, {
      timeout: 60000,
    });
  },
};
