import type {
  CardWithProgress,
  CEFRLevel,
  FSRSState,
  VocabSortOption,
} from '@/types/card.types';
import { useDeferredValue, useMemo, useState } from 'react';

export function useVocabFilter(
  rawCards: CardWithProgress[] = [],
  initialFsrsState: FSRSState = 'all'
) {
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [fsrsState, setFsrsState] = useState<FSRSState>(initialFsrsState);
  const [sortBy, setSortBy] = useState<VocabSortOption>('created_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract all unique tags across cards
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    rawCards.forEach((card) => {
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach((tag) => {
          if (typeof tag === 'string' && tag.trim().length > 0) {
            tagSet.add(tag.trim());
          }
        });
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
          (card.definition_en && card.definition_en.toLowerCase().includes(q)) ||
          (card.example_sentence && card.example_sentence.toLowerCase().includes(q)) ||
          (card.example_translation && card.example_translation.toLowerCase().includes(q))
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
        if (fsrsState === 'mastered') {
          return (Number(userCard.stability) || 0) >= 20;
        }
        if (fsrsState === 'learning') {
          return userCard.state !== 'new' && (Number(userCard.stability) || 0) < 20;
        }
        if (fsrsState === 'new') {
          return userCard.state === 'new';
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

  const resetFilters = () => {
    setSearchQuery('');
    setCefrLevel('all');
    setSelectedTag('all');
    setFsrsState('all');
    setSortBy('created_desc');
  };

  return {
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
  };
}
