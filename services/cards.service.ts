import { apiClient } from '@/lib/axios';
import type { Card, CardWithProgress, CreateCardDto } from '@/types/card.types';

export const cardsService = {
  /**
   * Lấy danh sách thẻ của user hiện tại
   */
  getCards: (): Promise<CardWithProgress[]> => {
    return apiClient.get('/cards');
  },

  /**
   * Tạo thẻ mới và khởi tạo FSRS state
   */
  createCard: (payload: CreateCardDto): Promise<Card> => {
    return apiClient.post('/cards', payload);
  },
};
