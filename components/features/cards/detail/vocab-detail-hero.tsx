'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import type { CardWithProgress } from '@/types/card.types';
import { formatIPA } from '@/utils/formatters';
import { BookOpen, Lightbulb, Quote, Sparkles } from 'lucide-react';
import React from 'react';

interface VocabDetailHeroProps {
  card: CardWithProgress;
}

export function VocabDetailHero({ card }: VocabDetailHeroProps) {
  return (
    <div className="space-y-5">
      {/* 1. MASTER VOCABULARY CARD */}
      <div className="rounded-2xl bg-surface/90 border border-border/70 shadow-sm overflow-hidden divide-y divide-border/40">
        {/* Header: Word & Phonetics */}
        <div className="p-6 sm:p-7 space-y-4 relative">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {card.word}
                </h1>
                {card.cefr_level && (
                  <CEFRBadge level={card.cefr_level} size="md" />
                )}
                {card.part_of_speech && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-hover text-slate-300 border border-border/70 capitalize">
                    {card.part_of_speech}
                  </span>
                )}
              </div>

              {/* IPA & Pronunciation Audio */}
              <div className="flex items-center gap-3">
                {card.ipa ? (
                  <span className="font-mono text-sm sm:text-[15px] text-slate-300 bg-base/70 px-3 py-1 rounded-lg border border-border/70 inline-flex items-center gap-1.5 shadow-2xs">
                    {formatIPA(card.ipa)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">Chưa có phiên âm IPA</span>
                )}
                <AudioButton text={card.word} size="md" />
              </div>
            </div>

            {/* AI Badge & Metadata */}
            <div className="flex flex-col items-end gap-2">
              {card.source_type === 'ai_generated' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/25 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Verified
                </span>
              )}
            </div>
          </div>

          {/* Tags inline */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-brand/90 bg-brand/10 px-2.5 py-0.5 rounded-md border border-brand/20 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Core Definition Section (Bilingual - English Primary) */}
        <div className="p-6 sm:p-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand" />
              <span>Định nghĩa</span>
            </span>
          </div>

          {card.definition_en ? (
            <div className=" space-y-2">
              {/* Primary English Definition (Bold, Large, White) */}
              <div className='flex items-start gap-2'>
                <span className="text-[11px] font-bold text-slate-400 bg-surface px-1.5 py-0.5 rounded border border-border/60 shrink-0 mt-0.5">
                  EN
                </span>
                <p className="text-md sm:text-lg font-bold text-white leading-relaxed tracking-tight">
                  {card.definition_en}
                </p>
              </div>

              {/* Secondary Vietnamese Definition (Subtle, Slate-300) */}
              <div className="flex items-start gap-2 pt-1.5 border-t border-border/40">
                <span className="text-[11px] font-bold text-slate-400 bg-surface px-1.5 py-0.5 rounded border border-border/60 shrink-0 mt-0.5">
                  VI
                </span>
                <p className="text-[14px] text-slate-300 font-medium leading-relaxed">
                  {card.definition}
                </p>
              </div>
            </div>
          ) : (
            /* Fallback for cards without English definition */
            <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
              {card.definition}
            </p>
          )}
        </div>

        {/* Context Example Sentence Section */}
        {card.example_sentence && (
          <div className="p-6 sm:p-7 bg-base/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-brand" />
                <span>Ví dụ ngữ cảnh thực tế</span>
              </span>
              <AudioButton text={card.example_sentence} size="sm" />
            </div>

            <div className="border-l-2 border-brand/80 pl-4 py-1 space-y-1.5">
              <p className="text-[15px] sm:text-[16.5px] text-slate-100 font-serif leading-relaxed">
                &ldquo;{card.example_sentence}&rdquo;
              </p>
              {card.example_translation && (
                <p className="text-[13.5px] sm:text-[14px] text-slate-400 font-normal leading-relaxed">
                  {card.example_translation}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. MNEMONIC INSIGHT */}
      {card.mnemonic && (
        <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/[0.04] to-transparent border border-amber-500/25 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Mẹo liên tưởng ghi nhớ (Mnemonic)
            </span>
          </div>
          <p className="text-[14.5px] sm:text-[15.5px] text-amber-100/95 leading-relaxed font-normal pl-9">
            {card.mnemonic}
          </p>
        </div>
      )}
    </div>
  );
}
