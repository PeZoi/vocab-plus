'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { LottieIcon } from '@/components/common/lottie-icon';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWordLevelInfo } from '@/hooks/common/use-word-level-info';
import { cn } from '@/lib/utils';
import type { Card, UserCard, CollocationItem, WordFamilyItem } from '@/types/card.types';
import { formatIPA } from '@/utils/formatters';
import { Lightbulb, RotateCw, Zap } from 'lucide-react';
import Image from 'next/image';

interface FlashcardProps {
  card: Card;
  userCard?: UserCard | null;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkKnown?: (cardId: string) => void;
}

export function Flashcard({ card, userCard, isFlipped, onFlip, onMarkKnown }: FlashcardProps) {
  const collocations = (card.collocations as unknown as CollocationItem[]) || [];
  const wordFamily = (card.word_family as unknown as WordFamilyItem[]) || [];
  const levelInfo = useWordLevelInfo({ userCard });

  return (
    <div
      onClick={onFlip}
      className="flip-card-container relative w-full min-h-[380px] sm:min-h-[420px] cursor-pointer select-none group"
    >
      <div className={cn('flip-card-inner', isFlipped && 'flipped')}>
        {/* ================= MẶT TRƯỚC (FRONT SIDE) ================= */}
        <div className="flip-card-face flip-card-front p-6 sm:p-8 flex flex-col justify-between bg-surface/95 border border-border/80 shadow-md transition-colors group-hover:border-border">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {card.cefr_level && (
                <CEFRBadge level={card.cefr_level} size="sm" />
              )}
              {card.part_of_speech && (
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  {card.part_of_speech}
                </Badge>
              )}
              {card.card_type && card.card_type !== 'word' && (
                <Badge variant="default" className="text-[10px] py-0 px-2">
                  {card.card_type}
                </Badge>
              )}
            </div>

            <span className="text-[11px] text-text-secondary group-hover:text-brand flex items-center gap-1 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Bấm để lật thẻ</span>
            </span>
          </div>

          {/* Card Body: Word, IPA, Audio & Word Level */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-3.5">
            <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
              {card.word}
            </h2>

            <div className="flex items-center justify-center gap-2.5">
              {card.ipa && (
                <span className="font-mono text-sm text-text-secondary">
                  {formatIPA(card.ipa)}
                </span>
              )}
              <AudioButton text={card.word} size="sm" />
            </div>

            {/* Word Level Icon centered */}
            <div className="flex flex-col items-center justify-center mt-8">
              <LottieIcon
                  animationKey={levelInfo.lottieKey}
                  size="xl"
                  loop
                  autoplay
                />
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 shadow-xs backdrop-blur-xs',
                  levelInfo.colorClasses.bg,
                  levelInfo.colorClasses.border
                )}
                title={`Cấp độ ${levelInfo.level}: ${levelInfo.name} (${levelInfo.stabilityDays} ngày nhớ)`}
              >
                
                <span className={cn('text-[10px] font-semibold tracking-wide', levelInfo.colorClasses.text)}>
                  Lv.{levelInfo.level} {levelInfo.name}
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer Hint */}
          <div className="text-center text-xs text-text-secondary/70">
            Nhấn phím [Space] hoặc chạm vào thẻ để lật xem đáp án
          </div>
        </div>

        {/* ================= MẶT SAU (BACK SIDE) ================= */}
        <div className="flip-card-face flip-card-back p-5 sm:p-7 flex flex-col justify-between bg-surface/95 border border-brand/40 shadow-lg brand-glow overflow-y-auto max-h-[560px]">
          {/* Card Header Back */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <WordLevelBadge userCard={userCard} mode="compact" />
              {card.cefr_level && (
                <CEFRBadge level={card.cefr_level} size="sm" />
              )}
              {card.part_of_speech && (
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  {card.part_of_speech}
                </Badge>
              )}
              <Badge variant="default" className="text-[10px] py-0 px-1.5 bg-brand/15 text-brand border-brand/30">
                Đáp án
              </Badge>
            </div>

            <span className="text-[11px] text-text-secondary group-hover:text-brand flex items-center gap-1 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Xem mặt trước</span>
            </span>
          </div>

          {/* Card Body: Definition, Example, Mnemonic */}
          <div className="flex-1 flex flex-col justify-center my-4 space-y-4 text-left">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary block mb-1">
                Định nghĩa:
              </span>
              {card.definition_en ? (
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-bold text-text-primary leading-snug">
                    {card.definition_en}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary font-medium">
                    {card.definition}
                  </p>
                </div>
              ) : (
                <p className="text-lg sm:text-xl font-semibold text-text-primary leading-snug">
                  {card.definition}
                </p>
              )}
            </div>

            {card.image_url && (
              <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-border/70 shadow-xs bg-base/50 shrink-0">
                <Image
                  src={card.image_url}
                  alt={card.word}
                  fill
                  sizes="(max-width: 640px) 100vw, 450px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {card.example_sentence && (
              <div className="p-3.5 rounded-xl bg-base/50 border border-border/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Ví dụ ngữ cảnh:
                  </span>
                  <AudioButton text={card.example_sentence} size="sm" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-[13px] text-text-primary italic leading-relaxed">
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

            {card.mnemonic && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand/5 border border-brand/20 text-xs">
                <Lightbulb className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-brand block">Mẹo nhớ:</span>
                  <p className="text-text-primary/90 text-xs mt-0.5">{card.mnemonic}</p>
                </div>
              </div>
            )}

            {/* Collocations & Word Family */}
            {((Array.isArray(collocations) && collocations.length > 0) ||
              (Array.isArray(wordFamily) && wordFamily.length > 0)) && (
              <div
                className="space-y-2.5 pt-2 border-t border-border/60"
                onClick={(e) => e.stopPropagation()}
              >
                {Array.isArray(collocations) && collocations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                      🔗 Cụm từ hay đi kèm:
                    </span>
                    <div className="space-y-1.5">
                      {collocations.slice(0, 3).map((col, i) => {
                        const phrase = typeof col === 'string' ? col : col.phrase;
                        const meaning = typeof col === 'object' ? col.meaning : null;
                        const example = typeof col === 'object' ? col.example : null;

                        return (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-base/50 border border-border/60 text-xs space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-brand text-xs">
                                {phrase}{meaning ? ` : ${meaning}` : ''}
                              </span>
                              {example && <AudioButton text={example} size="sm" />}
                            </div>
                            {example && (
                              <p className="text-text-secondary italic text-[11px] leading-relaxed">
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
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                      🌳 Từ vựng liên quan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {wordFamily.slice(0, 4).map((wf, i) => {
                        const formWord = typeof wf === 'string' ? wf : (wf.word || (wf as { form_word?: string }).form_word);
                        const pos = typeof wf === 'object' ? wf.part_of_speech : '';
                        const meaning = typeof wf === 'object' ? wf.meaning : null;
                        const example = typeof wf === 'object' ? wf.example : null;

                        return (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-base/50 border border-border/60 text-xs space-y-0.5 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-text-primary text-xs">{formWord}</span>
                                  {pos && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-base border border-border/60 text-text-secondary">
                                      {pos}
                                    </span>
                                  )}
                                </div>
                                {example && <AudioButton text={example} size="sm" />}
                              </div>
                              {meaning && (
                                <p className="text-text-secondary text-[10.5px] mt-0.5">{meaning}</p>
                              )}
                            </div>
                            {example && (
                              <p className="text-text-secondary italic text-[10.5px] leading-relaxed pt-1 border-t border-border/40 mt-1">
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
          </div>

          {/* Card Footer Hint & Quick Master Action */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-text-secondary/70">
              Bấm vào thẻ hoặc phím [Space] để lật
            </span>
            {onMarkKnown && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkKnown(card.id);
                }}
                className="h-7 px-2.5 text-[11px] gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/20 font-medium"
                title="Bỏ qua giai đoạn Hạt mầm nếu bạn đã thuộc từ này từ trước"
              >
                <Zap className="w-3 h-3 fill-amber-400" />
                <span>Tôi đã thuộc từ này</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
