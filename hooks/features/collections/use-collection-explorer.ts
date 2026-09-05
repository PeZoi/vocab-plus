import {
  useCollectionsQuery,
  useForkCollectionMutation,
  useToggleLikeMutation,
} from '@/hooks/features/collections/use-collections';
import type { Collection, CollectionCategory } from '@/types/collection.types';
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
    try {
      setForkingId(id);
      const res = await forkMutation.mutateAsync(id);
      alert(res.message || 'Đã clone bộ từ vựng thành công!');
      setActiveTab('my');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi clone bộ từ vựng';
      alert(msg);
    } finally {
      setForkingId(null);
    }
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
  };
}
