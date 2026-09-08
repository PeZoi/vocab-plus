import { apiClient } from '@/lib/axios';
import type {
  ReviewCardItem,
  ReviewForecastDay,
  ReviewStats,
  SubmitReviewDto,
} from '@/types/review.types';

export interface ReviewStatsResponse {
  stats: ReviewStats;
  forecast: ReviewForecastDay[];
}

export const reviewService = {
  /**
   * Lấy danh sách các thẻ cần review (hỗ trợ Custom Study Session)
   */
  getDueCards: (params?: {
    collection_id?: string;
    tag?: string;
    cefr_level?: string;
    card_ids?: string;
  }): Promise<ReviewCardItem[]> => {
    return apiClient.get('/review/due', { params });
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
