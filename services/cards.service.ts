import { apiClient } from '@/lib/axios';
import type {
  Card,
  CardFilterParams,
  CardWithProgress,
  CreateCardDto,
  UpdateCardDto,
} from '@/types/card.types';

export const cardsService = {
  /**
   * Lấy danh sách thẻ của user hiện tại kèm bộ lọc và tìm kiếm
   */
  getCards: (params?: CardFilterParams): Promise<CardWithProgress[]> => {
    return apiClient.get('/cards', { params });
  },

  /**
   * Lấy chi tiết một thẻ từ vựng
   */
  getCardById: (id: string): Promise<CardWithProgress> => {
    return apiClient.get(`/cards/${id}`);
  },

  /**
   * Tạo thẻ mới và khởi tạo FSRS state
   */
  createCard: (payload: CreateCardDto): Promise<Card> => {
    return apiClient.post('/cards', payload);
  },

  /**
   * Cập nhật thông tin thẻ từ vựng
   */
  updateCard: (id: string, payload: UpdateCardDto): Promise<CardWithProgress> => {
    return apiClient.put(`/cards/${id}`, payload);
  },

  /**
   * Xóa thẻ từ vựng
   */
  deleteCard: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/cards/${id}`);
  },
};
