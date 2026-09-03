import { apiClient } from '@/lib/axios';
import type {
  ReviewCardItem,
  SubmitReviewDto,
  ReviewStats,
  ReviewForecastDay,
} from '@/types/review.types';

export interface ReviewStatsResponse {
  stats: ReviewStats;
  forecast: ReviewForecastDay[];
}

export const reviewService = {
  /**
   * Lấy danh sách các thẻ cần review hôm nay
   */
  getDueCards: (): Promise<ReviewCardItem[]> => {
    return apiClient.get('/review/due');
  },

  /**
   * Gửi kết quả đánh giá thẻ (1-4) và tính toán FSRS kế tiếp
   */
  submitReview: (dto: SubmitReviewDto): Promise<{ success: boolean; due_at: string; state: string; xp_added: number }> => {
    return apiClient.post('/review/submit', dto);
  },

  /**
   * Lấy thống kê số từ, streak, XP và biểu đồ dự báo 7 ngày
   */
  getStats: (): Promise<ReviewStatsResponse> => {
    return apiClient.get('/review/stats');
  },
};
