import {
  useCollectionsQuery,
  useForkCollectionMutation,
  useToggleLikeMutation,
} from '@/hooks/features/collections/use-collections';
import { collectionsService } from '@/services/collections.service';
import type {
  AnalyzeForkResult,
  Collection,
  CollectionCategory,
} from '@/types/collection.types';
import { useDeferredValue, useState } from 'react';

export function useCollectionExplorer() {
  // Active Tab: 'my' | 'community'
  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'alpha'>(
    activeTab === 'community' ? 'popular' : 'newest'
  );

  // Modal target states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [forkingId, setForkingId] = useState<string | null>(null);
  const [forkSuccessResult, setForkSuccessResult] = useState<{
    collection: Collection;
    cardsCount: number;
  } | null>(null);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<{
    collection: Collection;
    analysis: AnalyzeForkResult;
  } | null>(null);
  const [forkLoadingState, setForkLoadingState] = useState<{
    isOpen: boolean;
    collectionTitle: string;
    isSuccess: boolean;
    pendingResult?: {
      collection: Collection;
      cardsCount: number;
    } | null;
  }>({
    isOpen: false,
    collectionTitle: '',
    isSuccess: false,
    pendingResult: null,
  });

  // Query
  const { data: collections = [], isLoading, refetch } = useCollectionsQuery({
    tab: activeTab,
    category: selectedCategory,
    search: deferredSearch.trim() || undefined,
    sort_by: sortBy,
  });

  const forkMutation = useForkCollectionMutation();
  const likeMutation = useToggleLikeMutation();

  const handleFork = async (id: string) => {
    const targetCol = collections.find((c) => c.id === id);
    try {
      setForkingId(id);
      setForkLoadingState({
        isOpen: true,
        collectionTitle: targetCol?.title || '',
        isSuccess: false,
        pendingResult: null,
      });

      // Bước 1: Phân tích trước xem có từ vựng nào bị trùng lặp không
      const analysis = await collectionsService.analyzeFork(id);

      if (analysis.has_duplicates && targetCol) {
        // Nếu có từ trùng -> Tạm đóng loading modal, chuyển sang modal giải quyết trùng lặp
        setForkLoadingState({
          isOpen: false,
          collectionTitle: '',
          isSuccess: false,
          pendingResult: null,
        });
        setDuplicateAnalysis({
          collection: targetCol,
          analysis,
        });
        return;
      }

      // Bước 2: Nếu không có từ trùng -> Tiếp tục Fork
      const res = await forkMutation.mutateAsync(id);
      if (res.collection) {
        setForkLoadingState((prev) => ({
          ...prev,
          isSuccess: true,
          pendingResult: {
            collection: res.collection,
            cardsCount: res.cards_cloned ?? 0,
          },
        }));
      } else {
        setForkLoadingState({
          isOpen: false,
          collectionTitle: '',
          isSuccess: false,
          pendingResult: null,
        });
      }
    } catch (err: unknown) {
      setForkLoadingState({
        isOpen: false,
        collectionTitle: '',
        isSuccess: false,
        pendingResult: null,
      });
      const msg = err instanceof Error ? err.message : 'Lỗi khi fork bộ từ vựng';
      console.error(msg);
    } finally {
      setForkingId(null);
    }
  };

  const handleConfirmSmartFork = async (selectedCardIds: string[]) => {
    if (!duplicateAnalysis) return;
    const targetCol = duplicateAnalysis.collection;
    const colId = targetCol.id;

    try {
      setForkingId(colId);
      // Đóng modal duplicate và bật modal loading
      setDuplicateAnalysis(null);
      setForkLoadingState({
        isOpen: true,
        collectionTitle: targetCol.title,
        isSuccess: false,
        pendingResult: null,
      });

      const res = await forkMutation.mutateAsync({
        id: colId,
        options: { selected_card_ids: selectedCardIds },
      });

      if (res.collection) {
        setForkLoadingState((prev) => ({
          ...prev,
          isSuccess: true,
          pendingResult: {
            collection: res.collection,
            cardsCount: res.cards_cloned ?? 0,
          },
        }));
      } else {
        setForkLoadingState({
          isOpen: false,
          collectionTitle: '',
          isSuccess: false,
          pendingResult: null,
        });
      }
    } catch (err: unknown) {
      setForkLoadingState({
        isOpen: false,
        collectionTitle: '',
        isSuccess: false,
        pendingResult: null,
      });
      const msg = err instanceof Error ? err.message : 'Lỗi khi clone bộ từ';
      console.error(msg);
    } finally {
      setForkingId(null);
    }
  };

  const handleFinishForkSuccess = () => {
    if (forkLoadingState.pendingResult) {
      setForkSuccessResult(forkLoadingState.pendingResult);
    }
    setForkLoadingState({
      isOpen: false,
      collectionTitle: '',
      isSuccess: false,
      pendingResult: null,
    });
    setActiveTab('my');
  };

  const handleToggleLike = async (id: string) => {
    try {
      await likeMutation.mutateAsync(id);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    sortBy !== (activeTab === 'community' ? 'popular' : 'newest');

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy(activeTab === 'community' ? 'popular' : 'newest');
  };

  const switchTab = (tab: 'my' | 'community') => {
    setActiveTab(tab);
    setSortBy(tab === 'community' ? 'popular' : 'newest');
  };

  return {
    activeTab,
    switchTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    collections,
    isLoading,
    refetch,
    isFiltered,
    resetFilters,
    forkingId,
    handleFork,
    handleToggleLike,
    isCreateOpen,
    setIsCreateOpen,
    editingCollection,
    setEditingCollection,
    deleteTarget,
    setDeleteTarget,
    forkSuccessResult,
    setForkSuccessResult,
    duplicateAnalysis,
    setDuplicateAnalysis,
    handleConfirmSmartFork,
    forkLoadingState,
    handleFinishForkSuccess,
  };
}
