'use client';

import { AudioButton } from '@/components/common/audio-button';
import { Badge } from '@/components/ui/badge';
import type { CollocationItem, WordFamilyItem } from '@/types/card.types';
import { GitFork, Layers, Link2 } from 'lucide-react';
import React from 'react';

interface VocabDetailExpansionProps {
  collocations: CollocationItem[];
  wordFamily: WordFamilyItem[];
}

export function VocabDetailExpansion({ collocations, wordFamily }: VocabDetailExpansionProps) {
  const hasCollocations = Array.isArray(collocations) && collocations.length > 0;
  const hasWordFamily = Array.isArray(wordFamily) && wordFamily.length > 0;

  if (!hasCollocations && !hasWordFamily) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-surface/90 border border-border/70 p-6 sm:p-7 space-y-6 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border/50 pb-3">
        <Layers className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Mở rộng từ vựng & Ngữ cảnh
        </h3>
      </div>

      {/* Collocations Section */}
      {hasCollocations && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Link2 className="w-3.5 h-3.5 text-brand" />
            <span>Cụm từ hay đi kèm (Collocations)</span>
            <span className="text-slate-500 font-normal">({collocations.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {collocations.map((col, idx) => {
              const phrase = typeof col === 'string' ? col : col.phrase;
              const meaning = typeof col === 'object' ? col.meaning : null;
              const example = typeof col === 'object' ? col.example : null;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-base/40 border border-border/60 hover:border-brand/40 hover:bg-base/60 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-brand text-[15px] sm:text-[16px]">
                        {phrase}
                      </span>
                      {example && <AudioButton text={example} size="sm" />}
                    </div>
                    {meaning && (
                      <p className="text-xs text-slate-200 mt-1.5 font-medium leading-normal">
                        {meaning}
                      </p>
                    )}
                  </div>
                  {example && (
                    <p className="text-xs text-slate-400 italic pt-2 border-t border-border/40 leading-relaxed">
                      &ldquo;{example}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Word Family Section */}
      {hasWordFamily && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <GitFork className="w-3.5 h-3.5 text-purple-400" />
            <span>Từ vựng liên quan</span>
            <span className="text-slate-500 font-normal">({wordFamily.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wordFamily.map((wf, idx) => {
              const formWord =
                typeof wf === 'string'
                  ? wf
                  : wf.word || (wf as { form_word?: string }).form_word;
              const pos = typeof wf === 'object' ? wf.part_of_speech : '';
              const meaning = typeof wf === 'object' ? wf.meaning : null;
              const example = typeof wf === 'object' ? wf.example : null;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-base/40 border border-border/60 hover:border-purple-400/40 hover:bg-base/60 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-[15px] sm:text-[16px]">
                          {formWord}
                        </span>
                        {pos && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 text-slate-300 bg-surface border-border">
                            {pos}
                          </Badge>
                        )}
                      </div>
                      {example && <AudioButton text={example} size="sm" />}
                    </div>
                    {meaning && (
                      <p className="text-xs text-slate-200 mt-1.5 font-medium leading-normal">
                        {meaning}
                      </p>
                    )}
                  </div>
                  {example && (
                    <p className="text-xs text-slate-400 italic pt-2 border-t border-border/40 leading-relaxed">
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
  );
}
