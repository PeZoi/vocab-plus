'use client';

import React from 'react';
import { DualAudioButtons } from '@/components/common/dual-audio-buttons';

export interface AudioButtonProps {
  text?: string;
  word?: string;
  cardId?: string;
  initialAudio?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * AudioButton: Component phát âm dùng chung toàn app, tự động hiển thị cặp nút chuẩn US và UK
 */
export function AudioButton({
  text,
  word,
  cardId,
  initialAudio,
  className,
  size = 'sm',
}: AudioButtonProps) {
  const targetWord = word || text || '';
  if (!targetWord.trim()) return null;

  const mappedSize = size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs';

  return (
    <DualAudioButtons
      word={targetWord}
      cardId={cardId}
      initialAudio={initialAudio}
      size={mappedSize}
      className={className}
    />
  );
}

