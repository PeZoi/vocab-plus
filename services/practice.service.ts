import { apiClient } from '@/lib/axios';
import type {
  SubmitPracticeSessionDto,
  SubmitPracticeSessionResponse,
} from '@/types/practice.types';

export const practiceService = {
  /**
   * Kết thúc phiên làm bài kiểm tra/luyện tập và tổng kết cập nhật XP
   */
  completeSession: (
    dto: SubmitPracticeSessionDto
  ): Promise<SubmitPracticeSessionResponse> => {
    return apiClient.post('/practice/complete', dto);
  },
};
