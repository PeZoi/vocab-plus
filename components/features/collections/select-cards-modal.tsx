'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { useAddCardsToCollectionMutation } from '@/hooks/features/collections/use-collections';
import { formatIPA } from '@/utils/formatters';
import {
  BookOpen,
  Check,
  CheckCheck,
  Loader2,
  Plus,
  Search
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

interface SelectCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  existingCardIds: string[];
  onSuccess?: () => void;
}

export function SelectCardsModal({
  isOpen,
  onClose,
  collectionId,
  existingCardIds,
  onSuccess,
}: SelectCardsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCardIds, setSelectedCardIds] = useState<Record<string, boolean>>({});
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch all user cards from vocab library
  const { data: allCards = [], isLoading } = useCardsQuery();
  const addCardsMutation = useAddCardsToCollectionMutation();

  const existingSet = useMemo(() => new Set(existingCardIds), [existingCardIds]);

  // Filter cards based on search query and "available only" toggle
  const filteredCards = useMemo(() => {
    let result = allCards;

    if (filterAvailableOnly) {
      result = result.filter((card) => !existingSet.has(card.id));
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase().trim();
      result = result.filter(
        (card) =>
          card.word.toLowerCase().includes(q) ||
          card.definition.toLowerCase().includes(q) ||
          (card.tags && card.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [allCards, existingSet, filterAvailableOnly, deferredSearch]);

  // Available cards that can be selected
  const selectableCards = useMemo(() => {
    return filteredCards.filter((c) => !existingSet.has(c.id));
  }, [filteredCards, existingSet]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedCardIds).filter(Boolean).length;
  }, [selectedCardIds]);

  const handleToggleCard = (cardId: string) => {
    if (existingSet.has(cardId)) return; // Already in collection
    setSelectedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleSelectAll = () => {
    const next: Record<string, boolean> = { ...selectedCardIds };
    selectableCards.forEach((card) => {
      next[card.id] = true;
    });
    setSelectedCardIds(next);
  };

  const handleDeselectAll = () => {
    setSelectedCardIds({});
  };

  const handleAdd = async () => {
    const cardIdsToAdd = Object.keys(selectedCardIds).filter((id) => !!selectedCardIds[id]);
    if (cardIdsToAdd.length === 0) return;

    try {
      await addCardsMutation.mutateAsync({
        collectionId,
        cardIds: cardIdsToAdd,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedCardIds({});
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err) {
      console.error('Lỗi khi thêm từ vào bộ sưu tập:', err);
    }
  };

  const handleClose = () => {
    if (!addCardsMutation.isPending) {
      setSelectedCardIds({});
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm từ vựng vào Bộ sưu tập"
      className="max-w-xl"
    >
      <div className="space-y-4 pt-1">
        {/* Search & Quick Filter Controls */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ vựng theo từ, nghĩa hoặc tag..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  filterAvailableOnly
                    ? 'bg-brand/10 border-brand/40 text-brand font-medium'
                    : 'bg-base/60 border-border/80 text-text-secondary hover:text-text-primary'
                }`}
              >
                {filterAvailableOnly ? 'Chỉ hiện từ chưa thêm' : 'Hiện tất cả từ'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectableCards.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-text-secondary hover:text-brand transition-colors text-[11px]"
                  >
                    Chọn tất cả ({selectableCards.length})
                  </button>
                  {selectedCount > 0 && (
                    <>
                      <span className="text-border">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-text-secondary hover:text-danger transition-colors text-[11px]"
                      >
                        Bỏ chọn
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card List */}
        <div className="border border-border/80 rounded-xl overflow-hidden bg-base/30">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-secondary">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <span className="text-xs">Đang tải kho từ vựng cá nhân...</span>
            </div>
          ) : allCards.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-text-secondary mx-auto opacity-50" />
              <p className="text-xs text-text-secondary">
                Kho từ vựng của bạn đang trống. Hãy thêm từ vựng trước để gom nhóm vào bộ sưu tập!
              </p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <p className="text-xs text-text-secondary">
                Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
              {filteredCards.map((card) => {
                const isAlreadyIn = existingSet.has(card.id);
                const isChecked = !!selectedCardIds[card.id];

                return (
                  <div
                    key={card.id}
                    onClick={() => handleToggleCard(card.id)}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                      isAlreadyIn
                        ? 'opacity-60 bg-base/60 cursor-not-allowed'
                        : isChecked
                        ? 'bg-brand/10 hover:bg-brand/15 cursor-pointer'
                        : 'hover:bg-surface/60 cursor-pointer'
                    }`}
                  >
                    {/* Checkbox & Word Information */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isAlreadyIn
                            ? 'bg-border/40 border-border/70 text-text-secondary/50'
                            : isChecked
                            ? 'bg-brand border-brand text-white'
                            : 'border-border/80 bg-surface'
                        }`}
                      >
                        {(isChecked || isAlreadyIn) && <Check className="w-3 h-3" />}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-text-primary">
                            {card.word}
                          </span>
                          {card.ipa && (
                            <span className="text-[11px] font-mono text-text-secondary whitespace-nowrap">
                              {formatIPA(card.ipa)}
                            </span>
                          )}
                          {card.cefr_level && (
                            <CEFRBadge level={card.cefr_level} size="sm" />
                          )}
                          {card.part_of_speech && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                              {card.part_of_speech}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {card.definition}
                        </p>
                        {card.tags && card.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {card.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-brand/10 text-brand/80 border border-brand/20 leading-tight"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audio & Badge */}
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AudioButton text={card.word} size="sm" />
                      {isAlreadyIn && (
                        <span className="text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border/60">
                          Đã có
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="text-xs text-text-secondary">
            {selectedCount > 0 ? (
              <span>
                Đã chọn <strong className="text-brand">{selectedCount}</strong> từ
              </span>
            ) : (
              <span>Chọn các từ cần thêm</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={addCardsMutation.isPending}
              className="text-xs"
            >
              Hủy
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={selectedCount === 0 || addCardsMutation.isPending || isSuccess}
              className="gap-1.5 text-xs bg-brand hover:bg-brand-hover text-white min-w-[130px]"
            >
              {addCardsMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                  <span>Đã thêm!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm {selectedCount > 0 ? `(${selectedCount})` : ''} vào bộ</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
