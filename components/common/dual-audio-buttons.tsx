'use client';

import React, { useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/common/use-text-to-speech';
import { cn } from '@/lib/utils';

interface DualAudioButtonsProps {
  word: string;
  cardId?: string;
  initialAudio?: string | null;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function DualAudioButtons({
  word,
  size = 'sm',
  className,
}: DualAudioButtonsProps) {
  const { speakWord, isPlaying, playingAccent } = useTextToSpeech();

  const isUsPlaying = isPlaying && playingAccent === 'us';
  const isUkPlaying = isPlaying && playingAccent === 'uk';

  const handlePlay = useCallback(
    (accent: 'us' | 'uk') => {
      speakWord(word, accent);
    },
    [speakWord, word]
  );

  const sizeConfigs = {
    xs: {
      button: 'px-2 py-0.5 text-[10px] gap-1',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      button: 'px-2.5 py-1 text-xs gap-1.5',
      icon: 'w-3 h-3',
    },
    md: {
      button: 'px-3.5 py-1.5 text-xs sm:text-[13px] gap-2',
      icon: 'w-3.5 h-3.5',
    },
  };

  const currentSize = sizeConfigs[size] || sizeConfigs.sm;

  return (
    <div className={cn('inline-flex items-center gap-1.5 select-none', className)}>
      {/* Nút phát âm US (Anh - Mỹ) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handlePlay('us');
        }}
        disabled={isPlaying}
        title={`Phát âm Anh - Mỹ (US): "${word}"`}
        className={cn(
          'inline-flex items-center rounded-full font-bold transition-all duration-200 border cursor-pointer active:scale-95 shadow-2xs',
          currentSize.button,
          isUsPlaying
            ? 'bg-blue-500/20 border-blue-400 text-blue-400 ring-2 ring-blue-400/40 shadow-blue-500/20 shadow-md'
            : 'bg-surface hover:bg-surface-hover border-border text-text-secondary hover:text-blue-400 hover:border-blue-400/40'
        )}
      >
        <span className="tracking-wide">US</span>
        <Volume2
          className={cn(
            'shrink-0 transition-transform',
            currentSize.icon,
            isUsPlaying && 'animate-pulse text-blue-400 scale-110'
          )}
        />
      </button>

      {/* Nút phát âm UK (Anh - Anh) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handlePlay('uk');
        }}
        disabled={isPlaying}
        title={`Phát âm Anh - Anh (UK): "${word}"`}
        className={cn(
          'inline-flex items-center rounded-full font-bold transition-all duration-200 border cursor-pointer active:scale-95 shadow-2xs',
          currentSize.button,
          isUkPlaying
            ? 'bg-rose-500/20 border-rose-400 text-rose-400 ring-2 ring-rose-400/40 shadow-rose-500/20 shadow-md'
            : 'bg-surface hover:bg-surface-hover border-border text-text-secondary hover:text-rose-400 hover:border-rose-400/40'
        )}
      >
        <span className="tracking-wide">UK</span>
        <Volume2
          className={cn(
            'shrink-0 transition-transform',
            currentSize.icon,
            isUkPlaying && 'animate-pulse text-rose-400 scale-110'
          )}
        />
      </button>
    </div>
  );
}
