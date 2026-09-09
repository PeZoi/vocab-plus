'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { CardWithProgress, CollocationItem, WordFamilyItem } from '@/types/card.types';
import { formatDateTime } from '@/utils/datetime';
import { formatIPA } from '@/utils/formatters';
import {
  AlertTriangle,
  Calendar,
  Edit2,
  FolderPlus,
  Lightbulb,
  Trash2,
  Zap
} from 'lucide-react';

interface CardDetailModalProps {
  card: CardWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (card: CardWithProgress) => void;
  onDelete?: (card: CardWithProgress) => void;
  onAddToCollection?: (card: CardWithProgress) => void;
}

export function CardDetailModal({
  card,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddToCollection,
}: CardDetailModalProps) {
  if (!card) return null;

  const userCard = card.user_card;
  const collocations = (card.collocations as unknown as CollocationItem[]) || [];
  const wordFamily = (card.word_family as unknown as WordFamilyItem[]) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xl font-bold text-text-primary">{card.word}</span>
          {card.cefr_level && <CEFRBadge level={card.cefr_level} size="md" />}
          <WordLevelBadge userCard={userCard} mode="compact" />
          {card.part_of_speech && (
            <Badge variant="secondary" className="text-xs">
              {card.part_of_speech}
            </Badge>
          )}
          {card.card_type && card.card_type !== 'word' && (
            <Badge variant="default" className="text-[10px]">
              {card.card_type}
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Phonetics & Audio */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-base/60 border border-border/70">
          <div className="flex items-center gap-3">
            {card.ipa && (
              <span className="font-mono text-sm text-text-secondary">
                {formatIPA(card.ipa)}
              </span>
            )}
            <AudioButton text={card.word} size="sm" />
          </div>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center justify-end">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-brand/90 bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Definition */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Định nghĩa:
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-base/40 border border-border/60 space-y-2">
            {card.definition_en ? (
              <>
                <p className="text-base sm:text-lg font-bold text-text-primary leading-relaxed">
                  {card.definition_en}
                </p>
                <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                  <span className="text-[10px] font-bold text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border/60 shrink-0 mt-0.5">
                    VI
                  </span>
                  <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed">
                    {card.definition}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm sm:text-base font-medium text-text-primary leading-relaxed">
                {card.definition}
              </p>
            )}
          </div>
        </div>

        {/* Example Sentence */}
        {card.example_sentence && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                Ví dụ ngữ cảnh:
              </span>
              <AudioButton text={card.example_sentence} size="sm" />
            </div>
            <div className="p-3 rounded-xl bg-base/40 border border-border/60 space-y-1">
              <p className="text-xs sm:text-sm text-text-primary italic leading-relaxed">
                &ldquo;{card.example_sentence}&rdquo;
              </p>
              {card.example_translation && (
                <p className="text-[11.5px] text-text-secondary not-italic leading-relaxed">
                  {card.example_translation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mnemonic */}
        {card.mnemonic && (
          <div className="p-3 rounded-xl bg-brand/5 border border-brand/20 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-brand block">Mẹo nhớ (Mnemonic):</span>
              <p className="text-xs text-text-primary/90 italic">{card.mnemonic}</p>
            </div>
          </div>
        )}

        {/* Collocations & Word Family */}
        {((Array.isArray(collocations) && collocations.length > 0) ||
          (Array.isArray(wordFamily) && wordFamily.length > 0)) && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            {Array.isArray(collocations) && collocations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <span>🔗 Cụm từ hay đi kèm (Collocations):</span>
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {collocations.map((col, i) => {
                    const phrase = typeof col === 'string' ? col : col.phrase;
                    const meaning = typeof col === 'object' ? col.meaning : null;
                    const example = typeof col === 'object' ? col.example : null;

                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-base/50 border border-border/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-brand text-[13px]">{phrase}</span>
                            {meaning && (
                              <span className="text-text-secondary text-xs">: {meaning}</span>
                            )}
                          </div>
                          {example && <AudioButton text={example} size="sm" />}
                        </div>
                        {example && (
                          <p className="text-text-secondary italic text-[11.5px] leading-relaxed">
                            &ldquo;{example}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Array.isArray(wordFamily) && wordFamily.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <span>🌳 Từ vựng liên quan:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {wordFamily.map((wf, i) => {
                    const formWord = typeof wf === 'string' ? wf : (wf.word || (wf as { form_word?: string }).form_word);
                    const pos = typeof wf === 'object' ? wf.part_of_speech : '';
                    const meaning = typeof wf === 'object' ? wf.meaning : null;
                    const example = typeof wf === 'object' ? wf.example : null;

                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-base/50 border border-border/70 text-xs space-y-1 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-text-primary text-[13px]">{formWord}</span>
                              {pos && (
                                <Badge variant="secondary" className="text-[9.5px] py-0 px-1.5">
                                  {pos}
                                </Badge>
                              )}
                            </div>
                            {example && <AudioButton text={example} size="sm" />}
                          </div>
                          {meaning && (
                            <p className="text-text-secondary text-[11.5px] mt-0.5">{meaning}</p>
                          )}
                        </div>
                        {example && (
                          <p className="text-text-secondary italic text-[11px] leading-relaxed pt-1 border-t border-border/40 mt-1">
                            &ldquo;{example}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cây Sinh Trưởng & Cấp Độ Trí Nhớ */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <span>🌱 Cây Sinh Trưởng & Cấp Độ Trí Nhớ:</span>
          </span>
          <WordLevelBadge userCard={userCard} mode="detailed" />
        </div>

        {/* FSRS Learning State Card */}
        {userCard && (
          <div className="p-3.5 rounded-xl bg-base/80 border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand" />
                <span>Tiến độ ghi nhớ FSRS</span>
              </span>
              <div className="flex items-center gap-1.5">
                {userCard.is_leech && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Từ khó (Leech)
                  </span>
                )}
                <Badge variant="default" className="capitalize text-[10px]">
                  {userCard.state === 'review'
                    ? 'Đang ôn tập'
                    : userCard.state === 'learning'
                    ? 'Đang học'
                    : userCard.state === 'relearning'
                    ? 'Học lại'
                    : 'Thẻ mới'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-surface border border-border/60">
                <span className="text-[10px] text-text-secondary block">Độ ổn định</span>
                <span className="font-mono font-bold text-text-primary">
                  {Number(userCard.stability || 0).toFixed(1)} ngày
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface border border-border/60">
                <span className="text-[10px] text-text-secondary block">Độ khó</span>
                <span className="font-mono font-bold text-text-primary">
                  {Number(userCard.difficulty || 0).toFixed(1)}/10
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface border border-border/60">
                <span className="text-[10px] text-text-secondary block">Lượt ôn</span>
                <span className="font-mono font-bold text-text-primary">
                  {userCard.review_count || 0}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-surface border border-border/60">
                <span className="text-[10px] text-text-secondary block">Số lần quên</span>
                <span className="font-mono font-bold text-text-primary">
                  {userCard.lapse_count || 0}
                </span>
              </div>
            </div>

            {userCard.due_at && (
              <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand" />
                  Hạn ôn tiếp theo:
                </span>
                <span className="font-mono text-text-primary">
                  {formatDateTime(userCard.due_at)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          {onAddToCollection && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onAddToCollection(card);
              }}
              className="gap-1.5 text-xs text-brand hover:text-brand hover:bg-brand/10 border-brand/30"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Bộ sưu tập</span>
            </Button>
          )}

          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(card);
              }}
              className="gap-1.5 text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </Button>
          )}

          {onDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(card);
              }}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa thẻ</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
