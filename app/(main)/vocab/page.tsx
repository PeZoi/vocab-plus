'use client';

import { EmptyState } from '@/components/common/empty-state';
import { CardDeleteDialog } from '@/components/features/cards/card-delete-dialog';
import { CardEditModal } from '@/components/features/cards/card-edit-modal';
import { VocabCardGrid } from '@/components/features/cards/vocab-card-grid';
import { VocabFiltersBar } from '@/components/features/cards/vocab-filters-bar';
import { VocabListHeader } from '@/components/features/cards/vocab-list-header';
import { VocabTableView } from '@/components/features/cards/vocab-table-view';
import { AddToCollectionModal } from '@/components/features/collections/add-to-collection-modal';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { useVocabFilter } from '@/hooks/features/cards/use-vocab-filter';
import type { CardWithProgress } from '@/types/card.types';
import { BookOpen, FolderPlus, Play, SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VocabPage() {
  const router = useRouter();

  // Modal states
  const [editCard, setEditCard] = useState<CardWithProgress | null>(null);
  const [deleteCard, setDeleteCard] = useState<CardWithProgress | null>(null);
  const [addToCollectionCard, setAddToCollectionCard] = useState<CardWithProgress | null>(null);
  const [bulkAddToCollectionCards, setBulkAddToCollectionCards] = useState<CardWithProgress[] | null>(null);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);

  // Selection states for bulk actions
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  // Fetch all user cards
  const { data: rawCards = [], isLoading, refetch } = useCardsQuery();

  // Encapsulated filter & sorting logic via custom hook
  const {
    searchQuery,
    setSearchQuery,
    cefrLevel,
    setCefrLevel,
    selectedTag,
    setSelectedTag,
    fsrsState,
    setFsrsState,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    availableTags,
    filteredCards,
    isFiltered,
    resetFilters,
  } = useVocabFilter(rawCards);

  const handleToggleSelectCard = (id: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const isAll = filteredCards.length > 0 && filteredCards.every((c) => selectedCardIds.has(c.id));
    if (isAll) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(filteredCards.map((c) => c.id)));
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <VocabListHeader
        totalCount={rawCards.length}
        filteredCount={filteredCards.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Filters Toolbar */}
      {rawCards.length > 0 && (
        <VocabFiltersBar
          availableTags={availableTags}
          cefrLevel={cefrLevel}
          onCefrChange={setCefrLevel}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          fsrsState={fsrsState}
          onFsrsStateChange={setFsrsState}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={resetFilters}
          isFiltered={isFiltered}
          filteredCount={filteredCards.length}
          onStartCustomStudy={() => {
            const query = new URLSearchParams();
            if (selectedTag !== 'all') query.set('tag', selectedTag.replace('#', ''));
            if (cefrLevel !== 'all') query.set('cefr_level', cefrLevel);
            router.push(`${ROUTES.APP.REVIEW}?${query.toString()}`);
          }}
        />
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-surface/60 border border-border/70 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <div className="pt-2 border-t border-border/50 flex justify-between">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : rawCards.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Kho từ vựng đang trống"
          description="Bạn chưa tạo thẻ từ vựng nào. Hãy bắt đầu thêm từ mới thủ công hoặc sử dụng AI phân tích từ vựng tự động!"
          actionText="Thêm từ vựng đầu tiên"
          onAction={() => router.push(ROUTES.APP.ADD)}
          className="my-8"
        />
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Không tìm thấy từ vựng phù hợp"
          description="Không có từ nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại của bạn."
          actionText="Đặt lại bộ lọc"
          onAction={resetFilters}
          className="my-8"
        />
      ) : viewMode === 'grid' ? (
        <VocabCardGrid
          cards={filteredCards}
          onViewDetail={(card) => router.push(ROUTES.APP.VOCAB_DETAIL(card.id))}
          onEdit={(card) => setEditCard(card)}
          onDelete={(card) => setDeleteCard(card)}
          onAddToCollection={(card) => setAddToCollectionCard(card)}
          selectedCardIds={selectedCardIds}
          onToggleSelectCard={handleToggleSelectCard}
        />
      ) : (
        <VocabTableView
          cards={filteredCards}
          onViewDetail={(card) => router.push(ROUTES.APP.VOCAB_DETAIL(card.id))}
          onEdit={(card) => setEditCard(card)}
          onDelete={(card) => setDeleteCard(card)}
          onAddToCollection={(card) => setAddToCollectionCard(card)}
          selectedCardIds={selectedCardIds}
          onToggleSelectCard={handleToggleSelectCard}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedCardIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/95 border border-brand/40 backdrop-blur-md rounded-2xl shadow-2xl p-2.5 sm:px-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold text-text-primary px-1">
            Đã chọn <strong className="text-brand font-bold">{selectedCardIds.size}</strong> từ
          </span>

          <div className="h-4 w-px bg-border/80" />

          <Button
            size="sm"
            onClick={() => {
              const ids = Array.from(selectedCardIds).join(',');
              router.push(`${ROUTES.APP.REVIEW}?card_ids=${ids}`);
            }}
            className="h-8 gap-1.5 text-xs bg-brand hover:bg-brand-hover text-white font-semibold shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Ôn tập ngay ({selectedCardIds.size})</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const picked = rawCards.filter((c) => selectedCardIds.has(c.id));
              setBulkAddToCollectionCards(picked);
            }}
            className="h-8 gap-1.5 text-xs border-border/80 text-text-primary hover:bg-surface-hover font-medium"
          >
            <FolderPlus className="w-3.5 h-3.5 text-brand" />
            <span>Thêm vào bộ từ</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedCardIds(new Set())}
            className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
          >
            Bỏ chọn
          </Button>
        </div>
      )}

      {/* Modals */}
      <CardEditModal
        card={editCard}
        isOpen={!!editCard}
        onClose={() => setEditCard(null)}
        onSuccess={() => refetch()}
      />

      <CardDeleteDialog
        card={deleteCard}
        isOpen={!!deleteCard}
        onClose={() => setDeleteCard(null)}
        onSuccess={() => refetch()}
      />

      <AddToCollectionModal
        card={addToCollectionCard}
        cards={bulkAddToCollectionCards || undefined}
        isOpen={Boolean(addToCollectionCard || bulkAddToCollectionCards)}
        onClose={() => {
          setAddToCollectionCard(null);
          setBulkAddToCollectionCards(null);
          setSelectedCardIds(new Set());
        }}
        onCreateNewCollection={() => {
          setAddToCollectionCard(null);
          setBulkAddToCollectionCards(null);
          setIsCreateCollectionOpen(true);
        }}
      />

      <CreateCollectionModal
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
      />
    </div>
  );
}
