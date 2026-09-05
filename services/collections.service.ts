import { apiClient } from '@/lib/axios';
import type {
  Collection,
  CollectionFilterParams,
  CollectionWithCards,
  CreateCollectionDto,
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

  forkCollection: (id: string): Promise<{
    success: boolean;
    message: string;
    collection: Collection;
    cards_cloned: number;
  }> => {
    return apiClient.post(`/collections/${id}/fork`);
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
