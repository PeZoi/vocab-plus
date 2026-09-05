'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { CardWithProgress } from '@/types/card.types';
import { formatIPA } from '@/utils/formatters';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface CollectionDetailWordListProps {
  cards: CardWithProgress[];
  isOwner: boolean;
  onRemoveCard: (cardId: string, word: string) => void;
  onOpenSelectCards: () => void;
}

export function CollectionDetailWordList({
  cards,
  isOwner,
  onRemoveCard,
  onOpenSelectCards,
}: CollectionDetailWordListProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
          Danh sách từ vựng trong bộ ({cards.length})
        </h2>

        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenSelectCards}
            className="gap-1.5 text-xs border-brand/40 text-brand hover:bg-brand/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kho từ vựng</span>
          </Button>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface/50 border border-dashed border-border/80 space-y-3">
          <BookOpen className="w-8 h-8 text-text-secondary mx-auto opacity-50" />
          <p className="text-xs text-text-secondary">
            Bộ sưu tập này chưa có từ vựng nào.
          </p>
          {isOwner && (
            <Button
              size="sm"
              onClick={onOpenSelectCards}
              className="gap-1.5 text-xs bg-brand hover:bg-brand-hover text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ vựng</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => router.push(ROUTES.APP.VOCAB_DETAIL(card.id))}
              className="group p-4 rounded-xl bg-surface/70 hover:bg-surface border border-border/70 hover:border-brand/40 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[15px] sm:text-[16px] text-text-primary group-hover:text-brand transition-colors">
                      {card.word}
                    </span>
                    {card.ipa && (
                      <span className="font-mono text-xs text-text-secondary whitespace-nowrap">
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
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AudioButton text={card.word} size="sm" />
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => onRemoveCard(card.id, card.word)}
                        title="Xóa khỏi bộ từ"
                        className="w-7 h-7 rounded hover:bg-danger/10 text-text-secondary hover:text-danger flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2">
                  {card.definition}
                </p>

                {card.example_sentence && (
                  <p className="text-[11.5px] text-text-secondary/80 italic line-clamp-1 border-l-2 border-border/60 pl-2">
                    &ldquo;{card.example_sentence}&rdquo;
                  </p>
                )}
              </div>

              {card.tags && card.tags.length > 0 && (
                <div className="flex items-center gap-1 pt-1 flex-wrap">
                  {card.tags.slice(0, 3).map((t, i) => (
                    <span
                      key={i}
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-base text-text-secondary border border-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
