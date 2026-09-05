'use client';

import { EmptyState } from '@/components/common/empty-state';
import { CollectionCardItem } from '@/components/features/collections/collection-card-item';
import { CollectionDeleteDialog } from '@/components/features/collections/collection-delete-dialog';
import { CollectionFiltersBar } from '@/components/features/collections/collection-filters-bar';
import { CollectionTabsNav } from '@/components/features/collections/collection-tabs-nav';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollectionExplorer } from '@/hooks/features/collections/use-collection-explorer';
import { BookOpen, FolderKanban, Plus, SearchX } from 'lucide-react';

export default function CollectionsPage() {
  const {
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
  } = useCollectionExplorer();

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Tabs Switcher */}
      <CollectionTabsNav activeTab={activeTab} onTabChange={switchTab} />

      {/* Filters Toolbar */}
      <CollectionFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={resetFilters}
        isFiltered={isFiltered}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-surface/60 border border-border/70 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="pt-3 border-t border-border/50 flex justify-between">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy bộ sưu tập"
            description="Không có bộ sưu tập nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn."
            actionText="Đặt lại bộ lọc"
            onAction={resetFilters}
            className="my-10"
          />
        ) : activeTab === 'my' ? (
          <EmptyState
            icon={BookOpen}
            title="Bạn chưa có bộ từ nào"
            description="Hãy tạo bộ từ đầu tiên để gom nhóm các từ vựng theo chủ đề bạn đang học, hoặc khám phá bộ từ của cộng đồng!"
            actionText="Tạo bộ từ mới"
            onAction={() => setIsCreateOpen(true)}
            className="my-10"
          />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="Thư viện cộng đồng đang trống"
            description="Chưa có bộ từ vựng nào được công khai trong danh mục này."
            className="my-10"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              onDelete={(c) => setDeleteTarget(c)}
              isForking={forkingId === col.id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateCollectionModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCollection(null);
        }}
        collectionToEdit={editingCollection}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Dialog */}
      <CollectionDeleteDialog
        collection={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
