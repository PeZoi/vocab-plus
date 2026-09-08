import { apiClient } from '@/lib/axios';
import type {
  AnalyzeForkResult,
  Collection,
  CollectionFilterParams,
  CollectionWithCards,
  CreateCollectionDto,
  ForkCollectionOptions,
  ForkResult,
  UpdateCollectionDto,
} from '@/types/collection.types';

export const collectionsService = {
  getCollections: (params?: CollectionFilterParams): Promise<Collection[]> => {
    return apiClient.get('/collections', { params });
  },

  getCollectionById: (id: string): Promise<CollectionWithCards> => {
    return apiClient.get(`/collections/${id}`);
  },

  createCollection: (dto: CreateCollectionDto): Promise<Collection> => {
    return apiClient.post('/collections', dto);
  },

  updateCollection: (id: string, dto: UpdateCollectionDto): Promise<Collection> => {
    return apiClient.put(`/collections/${id}`, dto);
  },

  deleteCollection: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/collections/${id}`);
  },

  analyzeFork: (id: string): Promise<AnalyzeForkResult> => {
    return apiClient.post(`/collections/${id}/analyze-fork`);
  },

  forkCollection: (id: string, options?: ForkCollectionOptions): Promise<ForkResult> => {
    return apiClient.post(`/collections/${id}/fork`, options);
  },

  toggleLikeCollection: (id: string): Promise<{
    is_liked: boolean;
    likes_count: number;
  }> => {
    return apiClient.post(`/collections/${id}/like`);
  },

  addCardsToCollection: (
    collectionId: string,
    cardIds: string[]
  ): Promise<{ success: boolean; count: number }> => {
    return apiClient.post(`/collections/${collectionId}/cards`, {
      card_ids: cardIds,
    });
  },

  removeCardFromCollection: (
    collectionId: string,
    cardId: string
  ): Promise<{ success: boolean }> => {
    return apiClient.delete(`/collections/${collectionId}/cards`, {
      params: { card_id: cardId },
    });
  },
};
