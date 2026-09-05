import { cardKeys, collectionKeys, reviewKeys } from '@/constants/query-keys';
import { collectionsService } from '@/services/collections.service';
import type {
  CollectionFilterParams,
  CreateCollectionDto,
  UpdateCollectionDto,
} from '@/types/collection.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCollectionsQuery(params?: CollectionFilterParams) {
  return useQuery({
    queryKey: collectionKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const data = await collectionsService.getCollections(params);
      return data ?? [];
    },
  });
}

export function useCollectionDetailQuery(id: string) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: async () => {
      const data = await collectionsService.getCollectionById(id);
      return data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCollectionDto) => collectionsService.createCollection(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCollectionDto }) =>
      collectionsService.updateCollection(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsService.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useForkCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsService.forkCollection(id),
    onSuccess: () => {
      // Invalidate collections, cards and review queues because new cards were added to user's deck!
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsService.toggleLikeCollection(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useAddCardsToCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, cardIds }: { collectionId: string; cardIds: string[] }) =>
      collectionsService.addCardsToCollection(collectionId, cardIds),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useRemoveCardFromCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collectionId, cardId }: { collectionId: string; cardId: string }) =>
      collectionsService.removeCardFromCollection(collectionId, cardId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}
