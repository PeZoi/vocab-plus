'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CardWithProgress } from '@/types/card.types';
import { formatIPA } from '@/utils/formatters';
import { AlertTriangle, Check, Edit2, Eye, FolderPlus, Trash2 } from 'lucide-react';

interface VocabTableViewProps {
  cards: CardWithProgress[];
  onViewDetail: (card: CardWithProgress) => void;
  onEdit: (card: CardWithProgress) => void;
  onDelete: (card: CardWithProgress) => void;
  onAddToCollection?: (card: CardWithProgress) => void;
  selectedCardIds?: Set<string>;
  onToggleSelectCard?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export function VocabTableView({
  cards,
  onViewDetail,
  onEdit,
  onDelete,
  onAddToCollection,
  selectedCardIds,
  onToggleSelectCard,
  onToggleSelectAll,
}: VocabTableViewProps) {
  const isSelectionMode = (selectedCardIds?.size ?? 0) > 0;
  const isAllSelected = cards.length > 0 && cards.every((c) => selectedCardIds?.has(c.id));
  const isSomeSelected = cards.some((c) => selectedCardIds?.has(c.id));

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/80 bg-surface/80">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border/80 bg-base/60 text-text-secondary font-medium">
            {onToggleSelectCard && (
              <th className="py-3 px-3 w-8">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-all',
                    isAllSelected
                      ? 'bg-brand border-brand text-white shadow-xs'
                      : isSomeSelected
                      ? 'border-brand/80 bg-brand/20'
                      : 'border-border/80 bg-base/70 hover:border-brand/60'
                  )}
                >
                  {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              </th>
            )}
            <th className="py-3 px-4 font-semibold">Từ vựng</th>
            <th className="py-3 px-3 font-semibold">Cấp độ</th>
            <th className="py-3 px-3 font-semibold">Từ loại</th>
            <th className="py-3 px-4 font-semibold">Định nghĩa tiếng Việt</th>
            <th className="py-3 px-3 font-semibold">Tags</th>
            <th className="py-3 px-3 font-semibold">Trạng thái</th>
            <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {cards.map((card) => {
            const userCard = card.user_card;
            const isDue = userCard?.due_at ? new Date(userCard.due_at) <= new Date() : false;
            const isSelected = selectedCardIds?.has(card.id);

            return (
              <tr
                key={card.id}
                onClick={(e) => {
                  // Nếu đang ở chế độ check: click vào dòng sẽ toggle check chứ không navigate
                  if (isSelectionMode && onToggleSelectCard) {
                    e.preventDefault();
                    onToggleSelectCard(card.id);
                    return;
                  }
                  onViewDetail(card);
                }}
                className={cn(
                  'transition-colors cursor-pointer group',
                  isSelected ? 'bg-brand/5 hover:bg-brand/10' : 'hover:bg-surface-hover/80'
                )}
              >
                {/* Checkbox */}
                {onToggleSelectCard && (
                  <td className="py-3 px-3 w-8" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleSelectCard(card.id)}
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-all',
                        isSelected
                          ? 'bg-brand border-brand text-white shadow-xs'
                          : 'border-border/80 bg-base/70 hover:border-brand/60'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>
                )}
                {/* Word & IPA */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <AudioButton text={card.word} size="sm" />
                    <div>
                      <span className="font-semibold text-text-primary group-hover:text-brand transition-colors text-sm">
                        {card.word}
                      </span>
                      {card.ipa && (
                        <span className="font-mono text-[11px] text-text-secondary block">
                          {formatIPA(card.ipa)}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* CEFR Level & Tree Level */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {card.cefr_level ? (
                      <CEFRBadge level={card.cefr_level} size="sm" />
                    ) : (
                      <span className="text-text-secondary/50">—</span>
                    )}
                    <WordLevelBadge userCard={userCard} mode="compact" />
                  </div>
                </td>

                {/* Part of Speech */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {card.part_of_speech ? (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {card.part_of_speech}
                    </Badge>
                  ) : (
                    <span className="text-text-secondary/50">—</span>
                  )}
                </td>

                {/* Definition */}
                <td className="py-3 px-4 max-w-[280px]">
                  <div className="space-y-0.5">
                    {card.definition_en && (
                      <p className="line-clamp-1 text-text-primary font-semibold leading-snug">
                        {card.definition_en}
                      </p>
                    )}
                    <p className={`line-clamp-1 ${card.definition_en ? 'text-text-secondary' : 'text-text-primary/90 font-medium'} leading-relaxed`}>
                      {card.definition}
                    </p>
                  </div>
                </td>

                {/* Tags */}
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {card.tags && card.tags.length > 0 ? (
                      card.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-brand/80 bg-brand/10 px-1.5 py-0.2 rounded border border-brand/20 font-medium"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-secondary/50 text-[10px]">—</span>
                    )}
                    {card.tags && card.tags.length > 2 && (
                      <span className="text-[10px] text-text-secondary">
                        +{card.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* FSRS Status */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {userCard?.is_leech ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      Leech
                    </span>
                  ) : isDue ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      Cần ôn tập
                    </span>
                  ) : (Number(userCard?.stability) || 0) >= 20 ? (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1"
                      title={`Đã thuộc (Độ bền: ${Math.round(Number(userCard?.stability) || 0)} ngày)`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Đã thuộc
                    </span>
                  ) : userCard?.state && userCard.state !== 'new' ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      Đang học
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-secondary/70 px-2 py-0.5 rounded-full bg-surface border border-border/60">
                      Chưa học
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onViewDetail(card)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-base/70 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
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
                      title="Chỉnh sửa thẻ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(card)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Xóa thẻ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
