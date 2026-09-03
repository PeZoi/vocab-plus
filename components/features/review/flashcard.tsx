'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AudioButton } from '@/components/common/audio-button';
import { formatIPA } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { Card } from '@/types/card.types';
import { RotateCw, Lightbulb } from 'lucide-react';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ card, isFlipped, onFlip }: FlashcardProps) {
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
            <div className="flex items-center gap-1.5">
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

          {/* Card Body: Word, IPA, Audio */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4">
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
          </div>

          {/* Card Footer Hint */}
          <div className="text-center text-xs text-text-secondary/70">
            Nhấn phím [Space] hoặc chạm vào thẻ để lật xem đáp án
          </div>
        </div>

        {/* ================= MẶT SAU (BACK SIDE) ================= */}
        <div className="flip-card-face flip-card-back p-6 sm:p-8 flex flex-col justify-between bg-surface/95 border border-brand/40 shadow-lg brand-glow">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block mb-1">
                Định nghĩa:
              </span>
              <p className="text-lg sm:text-xl font-semibold text-text-primary leading-snug">
                {card.definition}
              </p>
            </div>

            {card.example_sentence && (
              <div className="p-3.5 rounded-xl bg-base/50 border border-border/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Ví dụ ngữ cảnh:
                  </span>
                  <AudioButton text={card.example_sentence} size="sm" />
                </div>
                <p className="text-xs text-text-primary italic leading-relaxed">
                  &ldquo;{card.example_sentence}&rdquo;
                </p>
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
          </div>

          {/* Card Footer Hint */}
          <div className="text-center text-xs text-text-secondary/70">
            Chọn mức độ ghi nhớ 1, 2, 3, 4 bên dưới
          </div>
        </div>
      </div>
    </div>
  );
}
