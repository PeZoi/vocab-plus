'use client';

import { EmptyState } from '@/components/common/empty-state';
import { CollectionCardItem } from '@/components/features/collections/collection-card-item';
import { CollectionDeleteDialog } from '@/components/features/collections/collection-delete-dialog';
import { CollectionFiltersBar } from '@/components/features/collections/collection-filters-bar';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCollectionsQuery,
  useForkCollectionMutation,
  useToggleLikeMutation
} from '@/hooks/features/collections/use-collections';
import type { Collection, CollectionCategory } from '@/types/collection.types';
import {
  BookOpen,
  FolderKanban,
  Globe,
  Plus,
  SearchX,
  User
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';

export default function CollectionsPage() {
  // Active Tab: 'my' | 'community'
  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'alpha'>(
    activeTab === 'community' ? 'popular' : 'newest'
  );

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [forkingId, setForkingId] = useState<string | null>(null);

  // Data fetching
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
      // Switch to 'my' tab so user can immediately see their cloned set
      setActiveTab('my');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Lỗi khi clone bộ từ vựng');
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

  const handleDelete = (collection: Collection) => {
    setDeleteTarget(collection);
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    sortBy !== (activeTab === 'community' ? 'popular' : 'newest');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy(activeTab === 'community' ? 'popular' : 'newest');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">
                Bộ Sưu Tập & Thư Viện Cộng Đồng
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Đóng gói vốn từ theo chủ đề, ôn tập tập trung và khám phá các bộ từ nổi bật
              </p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          onClick={() => {
            setEditingCollection(null);
            setIsCreateOpen(true);
          }}
          className="gap-2 text-xs bg-brand hover:bg-brand-hover text-white shadow-xs shadow-brand/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bộ từ mới</span>
        </Button>
      </div>

      {/* Tabs Switcher: "Bộ từ của tôi" vs "Thư viện cộng đồng" */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('my');
            setSortBy('newest');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'my'
              ? 'bg-brand text-white shadow-xs shadow-brand/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Bộ từ của tôi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('community');
            setSortBy('popular');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'community'
              ? 'bg-brand text-white shadow-xs shadow-brand/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Khám phá cộng đồng</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <CollectionFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-surface/60 border border-border/70 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={isFiltered ? SearchX : activeTab === 'my' ? BookOpen : Globe}
          title={
            isFiltered
              ? 'Không tìm thấy bộ từ phù hợp'
              : activeTab === 'my'
              ? 'Bạn chưa tạo bộ từ nào'
              : 'Chưa có bộ sưu tập cộng đồng nào'
          }
          description={
            isFiltered
              ? 'Không có bộ sưu tập nào khớp với từ khóa tìm kiếm hoặc danh mục đã chọn.'
              : activeTab === 'my'
              ? 'Tạo bộ sưu tập riêng theo mục tiêu học (IELTS, giao tiếp, công việc) để ôn tập tập trung!'
              : 'Hãy là người đầu tiên chia sẻ bộ từ vựng hữu ích cho cộng đồng học viên!'
          }
          actionText={
            isFiltered
              ? 'Đặt lại bộ lọc'
              : activeTab === 'my'
              ? 'Tạo bộ sưu tập đầu tiên'
              : undefined
          }
          onAction={
            isFiltered
              ? handleResetFilters
              : activeTab === 'my'
              ? () => setIsCreateOpen(true)
              : undefined
          }
          className="my-10"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {collections.map((col) => (
            <CollectionCardItem
              key={col.id}
              collection={col}
              onFork={handleFork}
              onToggleLike={handleToggleLike}
              onEdit={(c) => {
                setEditingCollection(c);
                setIsCreateOpen(true);
              }}
              onDelete={handleDelete}
              isForking={forkingId === col.id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCollection(null);
        }}
        collectionToEdit={editingCollection}
        onSuccess={() => refetch()}
      />

      {/* Delete Collection Dialog */}
      <CollectionDeleteDialog
        collection={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
