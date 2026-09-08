'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CardWithProgress } from '@/types/card.types';
import { formatDateTime } from '@/utils/datetime';
import { formatIPA } from '@/utils/formatters';
import { AlertTriangle, Calendar, Check, Edit2, FolderPlus, Trash2 } from 'lucide-react';

interface VocabCardGridProps {
  cards: CardWithProgress[];
  onViewDetail: (card: CardWithProgress) => void;
  onEdit: (card: CardWithProgress) => void;
  onDelete: (card: CardWithProgress) => void;
  onAddToCollection?: (card: CardWithProgress) => void;
  selectedCardIds?: Set<string>;
  onToggleSelectCard?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export function VocabCardGrid({
  cards,
  onViewDetail,
  onEdit,
  onDelete,
  onAddToCollection,
  selectedCardIds,
  onToggleSelectCard,
  onToggleSelectAll,
}: VocabCardGridProps) {
  const isSelectionMode = (selectedCardIds?.size ?? 0) > 0;
  const isAllSelected = cards.length > 0 && cards.every((c) => selectedCardIds?.has(c.id));
  const isSomeSelected = cards.some((c) => selectedCardIds?.has(c.id));

  return (
    <div className="space-y-3">
      {/* Selection Control Bar */}
      {onToggleSelectAll && cards.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/60 border border-border/60 text-xs">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none"
          >
            <div
              className={cn(
                'w-4 h-4 rounded border flex items-center justify-center transition-all',
                isAllSelected
                  ? 'bg-brand border-brand text-white shadow-xs'
                  : isSomeSelected
                  ? 'border-brand/80 bg-brand/20 text-brand'
                  : 'border-border/80 bg-base/70'
              )}
            >
              {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
              {!isAllSelected && isSomeSelected && <div className="w-1.5 h-1.5 rounded-xs bg-brand" />}
            </div>
            <span className="font-medium">
              {isAllSelected
                ? `Đã chọn tất cả (${cards.length} từ)`
                : isSomeSelected
                ? `Đã chọn ${selectedCardIds?.size ?? 0} / ${cards.length} từ (Bấm để chọn tất cả)`
                : `Chọn tất cả (${cards.length} từ)`}
            </span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {cards.map((card) => {
          const userCard = card.user_card;
          const isDue = userCard?.due_at ? new Date(userCard.due_at) <= new Date() : false;
          const isSelected = selectedCardIds?.has(card.id);

          return (
            <div
              key={card.id}
              onClick={(e) => {
                // Nếu đang ở chế độ check: click vào card sẽ toggle check chứ không navigate
                if (isSelectionMode && onToggleSelectCard) {
                  e.preventDefault();
                  onToggleSelectCard(card.id);
                  return;
                }
                onViewDetail(card);
              }}
              className={cn(
                'group relative p-4 rounded-2xl bg-surface/90 border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3',
                isSelected
                  ? 'border-brand ring-1 ring-brand/50 shadow-xs shadow-brand/10'
                  : 'border-border/80 hover:border-brand/40'
              )}
            >
            {/* Header: Badges, Checkbox & Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {onToggleSelectCard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectCard(card.id);
                    }}
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center transition-all mr-1',
                      isSelected
                        ? 'bg-brand border-brand text-white shadow-xs'
                        : 'border-border/80 bg-base/70 hover:border-brand/60'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                )}
                {card.cefr_level && <CEFRBadge level={card.cefr_level} size="sm" />}
                {card.part_of_speech && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                    {card.part_of_speech}
                  </Badge>
                )}
                {userCard?.is_leech && (
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Leech
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <AudioButton text={card.word} size="sm" />
                {onAddToCollection && (
                  <button
                    type="button"
                    onClick={() => onAddToCollection(card)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors"
                    title="Thêm vào bộ sưu tập"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(card)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-base/70 transition-colors"
                  title="Chỉnh sửa từ vựng"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(card)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Xóa từ vựng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Word & IPA */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-brand transition-colors tracking-tight">
                  {card.word}
                </h3>
                {card.ipa && (
                  <span className="font-mono text-xs text-text-secondary">
                    {formatIPA(card.ipa)}
                  </span>
                )}
              </div>

              {/* Definition */}
              <div className="space-y-1">
                {card.definition_en && (
                  <p className="text-xs sm:text-sm text-text-primary font-semibold line-clamp-2 leading-snug">
                    {card.definition_en}
                  </p>
                )}
                <p className={`text-xs ${card.definition_en ? 'text-text-secondary line-clamp-1' : 'text-text-primary/90 font-medium line-clamp-2'} leading-relaxed`}>
                  {card.definition}
                </p>
              </div>

              {/* Example sentence snippet */}
              {card.example_sentence && (
                <div className="pt-0.5 space-y-0.5">
                  <p className="text-xs text-text-secondary italic line-clamp-1">
                    &ldquo;{card.example_sentence}&rdquo;
                  </p>
                  {card.example_translation && (
                    <p className="text-[11px] text-text-secondary/70 line-clamp-1">
                      {card.example_translation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer: Tags & FSRS Status */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] gap-2">
              {/* Tags */}
              <div className="flex items-center gap-1 overflow-hidden flex-wrap max-w-[65%]">
                {card.tags && card.tags.length > 0 ? (
                  card.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-brand/80 bg-brand/10 px-1.5 py-0.2 rounded border border-brand/20 truncate"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-text-secondary/50">Chưa gắn tag</span>
                )}
                {card.tags && card.tags.length > 3 && (
                  <span className="text-[10px] text-text-secondary">
                    +{card.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Due Date or State */}
              {userCard && (
                <div className="flex items-center gap-1 text-[10px] shrink-0 font-medium">
                  {isDue ? (
                    <span className="text-brand font-semibold px-1.5 py-0.2 rounded bg-brand/10 border border-brand/20">
                      Cần ôn tập
                    </span>
                  ) : userCard.due_at ? (
                    <span
                      className="text-text-secondary flex items-center gap-0.5"
                      title={`Hạn ôn: ${formatDateTime(userCard.due_at)}`}
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(userCard.due_at).toLocaleDateString('vi-VN', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-text-secondary">Mới</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
