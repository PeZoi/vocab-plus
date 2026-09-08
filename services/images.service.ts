import { apiClient } from '@/lib/axios';
import type { ImageSearchResponse } from '@/types/image.types';

export const imagesService = {
  /**
   * Tìm kiếm ảnh minh họa từ Pexels API
   */
  searchImages: (query: string, perPage: number = 6): Promise<ImageSearchResponse> => {
    return apiClient.get('/images/search', {
      params: { query, per_page: perPage },
    });
  },
};
