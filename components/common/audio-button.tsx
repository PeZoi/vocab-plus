'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/common/use-text-to-speech';
import { cn } from '@/lib/utils';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioButton({ text, className, size = 'md' }: AudioButtonProps) {
  const { speak, isPlaying } = useTextToSpeech();

  const sizeClasses = {
    sm: 'w-7 h-7 p-1',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      disabled={isPlaying}
      title={`Phát âm "${text}"`}
      className={cn(
        'rounded-full bg-surface hover:bg-surface-hover border border-border text-brand hover:text-brand-hover flex items-center justify-center transition-all active:scale-90',
        isPlaying && 'ring-2 ring-brand ring-offset-2 ring-offset-base animate-pulse text-brand-hover',
        sizeClasses[size],
        className
      )}
    >
      <Volume2 className={iconSizes[size]} />
    </button>
  );
}
