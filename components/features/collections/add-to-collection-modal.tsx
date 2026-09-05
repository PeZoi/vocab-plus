'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { COLLECTION_CATEGORY_MAP } from '@/constants/categories';
import {
  useAddCardsToCollectionMutation,
  useCollectionsQuery,
} from '@/hooks/features/collections/use-collections';
import type { CardWithProgress } from '@/types/card.types';
import { formatIPA } from '@/utils/formatters';
import { BookOpen, Check, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddToCollectionModalProps {
  card: CardWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateNewCollection?: () => void;
}

export function AddToCollectionModal({
  card,
  isOpen,
  onClose,
  onCreateNewCollection,
}: AddToCollectionModalProps) {
  const [selectedColIds, setSelectedColIds] = useState<Record<string, boolean>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch only user's own collections
  const { data: collections = [], isLoading } = useCollectionsQuery({ tab: 'my' });
  const addCardsMutation = useAddCardsToCollectionMutation();

  const handleToggle = (id: string) => {
    setSelectedColIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleConfirm = async () => {
    if (!card) return;
    const targetIds = Object.keys(selectedColIds).filter((id) => !!selectedColIds[id]);
    if (targetIds.length === 0) return;

    try {
      for (const colId of targetIds) {
        await addCardsMutation.mutateAsync({
          collectionId: colId,
          cardIds: [card.id],
        });
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error adding card to collections:', err);
    }
  };

  if (!card) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm vào Bộ sưu tập"
      className="max-w-md"
    >
      <div className="space-y-4 pt-1">
        {/* Card info preview */}
        <div className="p-3.5 rounded-xl bg-base/60 border border-border/70 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-text-primary">
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
          <AudioButton text={card.word} size="sm" />
        </div>

        {/* Collections checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Chọn bộ từ của bạn:
            </span>
            {onCreateNewCollection && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateNewCollection();
                }}
                className="text-xs text-brand hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo bộ mới</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-secondary">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <span className="text-xs">Đang tải danh sách bộ từ...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-6 text-center space-y-2.5 rounded-xl border border-dashed border-border/80">
              <BookOpen className="w-8 h-8 text-text-secondary mx-auto opacity-50" />
              <p className="text-xs text-text-secondary">
                Bạn chưa có bộ sưu tập nào. Hãy tạo bộ sưu tập đầu tiên để gom nhóm từ vựng!
              </p>
              {onCreateNewCollection && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onCreateNewCollection();
                  }}
                  className="gap-1.5 text-xs border-brand/40 text-brand hover:bg-brand/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo bộ sưu tập ngay</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {collections.map((col) => {
                const isSelected = !!selectedColIds[col.id];
                const catInfo = COLLECTION_CATEGORY_MAP[col.category] || COLLECTION_CATEGORY_MAP.other;

                return (
                  <div
                    key={col.id}
                    onClick={() => handleToggle(col.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                      isSelected
                        ? 'bg-brand/10 border-brand/50 shadow-xs'
                        : 'bg-surface hover:bg-surface-hover border-border/70'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-medium text-xs text-text-primary block truncate">
                        {col.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-brand">
                          {catInfo.label}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          • {col.card_count || 0} từ
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-brand border-brand text-white'
                          : 'border-border bg-base'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={addCardsMutation.isPending}
          >
            Đóng
          </Button>

          {collections.length > 0 && (
            <Button
              onClick={handleConfirm}
              size="sm"
              disabled={
                addCardsMutation.isPending ||
                Object.values(selectedColIds).filter(Boolean).length === 0
              }
              className="gap-1.5 bg-brand hover:bg-brand-hover text-white min-w-[90px]"
            >
              {addCardsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSuccess ? (
                <span>Đã lưu!</span>
              ) : (
                <span>Lưu vào bộ</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
