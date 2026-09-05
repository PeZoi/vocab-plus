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
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import type {
  CardWithProgress,
  CEFRLevel,
  FSRSState,
  VocabSortOption,
} from '@/types/card.types';
import { BookOpen, SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useMemo, useState } from 'react';

export default function VocabPage() {
  const router = useRouter();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [fsrsState, setFsrsState] = useState<FSRSState>('all');
  const [sortBy, setSortBy] = useState<VocabSortOption>('created_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [editCard, setEditCard] = useState<CardWithProgress | null>(null);
  const [deleteCard, setDeleteCard] = useState<CardWithProgress | null>(null);
  const [addToCollectionCard, setAddToCollectionCard] = useState<CardWithProgress | null>(null);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);

  // Fetch all user cards (we query from API and filter client-side for smooth and responsive feel)
  const { data: rawCards = [], isLoading, isError, refetch } = useCardsQuery();

  // Extract all unique tags across cards
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    rawCards.forEach((card) => {
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [rawCards]);

  // Client-side filtering & sorting
  const filteredCards = useMemo(() => {
    let result = [...rawCards];

    // Search query
    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      result = result.filter(
        (card) =>
          card.word.toLowerCase().includes(q) ||
          card.definition.toLowerCase().includes(q) ||
          (card.example_sentence && card.example_sentence.toLowerCase().includes(q))
      );
    }

    // CEFR Level filter
    if (cefrLevel !== 'all') {
      result = result.filter((card) => card.cefr_level?.toUpperCase() === cefrLevel);
    }

    // Tag filter
    if (selectedTag !== 'all') {
      result = result.filter(
        (card) => card.tags && card.tags.includes(selectedTag)
      );
    }

    // FSRS State filter
    if (fsrsState !== 'all') {
      result = result.filter((card) => {
        const userCard = card.user_card;
        if (!userCard) return fsrsState === 'new';

        if (fsrsState === 'leech') {
          return !!userCard.is_leech;
        }
        if (fsrsState === 'review') {
          return userCard.due_at ? new Date(userCard.due_at) <= new Date() : false;
        }
        return userCard.state === fsrsState;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'created_desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'alpha_asc':
          return a.word.localeCompare(b.word);
        case 'alpha_desc':
          return b.word.localeCompare(a.word);
        case 'due_asc': {
          const dueA = a.user_card?.due_at ? new Date(a.user_card.due_at).getTime() : Infinity;
          const dueB = b.user_card?.due_at ? new Date(b.user_card.due_at).getTime() : Infinity;
          return dueA - dueB;
        }
        case 'due_desc': {
          const dueA = a.user_card?.due_at ? new Date(a.user_card.due_at).getTime() : 0;
          const dueB = b.user_card?.due_at ? new Date(b.user_card.due_at).getTime() : 0;
          return dueB - dueA;
        }
        case 'difficulty_desc': {
          const diffA = a.user_card?.difficulty || 0;
          const diffB = b.user_card?.difficulty || 0;
          return Number(diffB) - Number(diffA);
        }
        case 'stability_desc': {
          const stabA = a.user_card?.stability || 0;
          const stabB = b.user_card?.stability || 0;
          return Number(stabB) - Number(stabA);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [rawCards, deferredSearch, cefrLevel, selectedTag, fsrsState, sortBy]);

  const isFiltered =
    searchQuery.trim() !== '' ||
    cefrLevel !== 'all' ||
    selectedTag !== 'all' ||
    fsrsState !== 'all' ||
    sortBy !== 'created_desc';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCefrLevel('all');
    setSelectedTag('all');
    setFsrsState('all');
    setSortBy('created_desc');
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
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
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
          onAction={handleResetFilters}
          className="my-8"
        />
      ) : viewMode === 'grid' ? (
        <VocabCardGrid
          cards={filteredCards}
          onViewDetail={(card) => router.push(ROUTES.APP.VOCAB_DETAIL(card.id))}
          onEdit={(card) => setEditCard(card)}
          onDelete={(card) => setDeleteCard(card)}
          onAddToCollection={(card) => setAddToCollectionCard(card)}
        />
      ) : (
        <VocabTableView
          cards={filteredCards}
          onViewDetail={(card) => router.push(ROUTES.APP.VOCAB_DETAIL(card.id))}
          onEdit={(card) => setEditCard(card)}
          onDelete={(card) => setDeleteCard(card)}
          onAddToCollection={(card) => setAddToCollectionCard(card)}
        />
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
        isOpen={!!addToCollectionCard}
        onClose={() => setAddToCollectionCard(null)}
        onCreateNewCollection={() => {
          setAddToCollectionCard(null);
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
