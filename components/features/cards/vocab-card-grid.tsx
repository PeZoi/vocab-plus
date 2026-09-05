'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Badge } from '@/components/ui/badge';
import type { CardWithProgress } from '@/types/card.types';
import { formatDateTime } from '@/utils/datetime';
import { formatIPA } from '@/utils/formatters';
import { AlertTriangle, Calendar, Edit2, FolderPlus, Trash2 } from 'lucide-react';

interface VocabCardGridProps {
  cards: CardWithProgress[];
  onViewDetail: (card: CardWithProgress) => void;
  onEdit: (card: CardWithProgress) => void;
  onDelete: (card: CardWithProgress) => void;
  onAddToCollection?: (card: CardWithProgress) => void;
}

export function VocabCardGrid({
  cards,
  onViewDetail,
  onEdit,
  onDelete,
  onAddToCollection,
}: VocabCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {cards.map((card) => {
        const userCard = card.user_card;
        const isDue = userCard?.due_at ? new Date(userCard.due_at) <= new Date() : false;

        return (
          <div
            key={card.id}
            onClick={() => onViewDetail(card)}
            className="group relative p-4 rounded-2xl bg-surface/90 border border-border/80 hover:border-brand/40 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3"
          >
            {/* Header: Badges & Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
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
              <p className="text-xs sm:text-sm text-text-primary/90 font-medium line-clamp-2 leading-relaxed">
                {card.definition}
              </p>

              {/* Example sentence snippet */}
              {card.example_sentence && (
                <p className="text-xs text-text-secondary italic line-clamp-1 pt-0.5">
                  &ldquo;{card.example_sentence}&rdquo;
                </p>
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
  );
}
