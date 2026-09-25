'use client';

import React, { useRef, useEffect } from 'react';
import type { ChunkClozeItem } from '@/types/listening.types';

interface ChunkClozeViewProps {
  item: ChunkClozeItem;
  segmentId?: string;
  userAnswer: string;
  showHint: boolean;
  showAnswer: boolean;
  isCompleted?: boolean;
  onAnswerChange: (value: string) => void;
  onEnterPress: () => void;
}

export function ChunkClozeView({
  item,
  segmentId,
  userAnswer,
  showHint,
  showAnswer,
  isCompleted = false,
  onAnswerChange,
  onEnterPress,
}: ChunkClozeViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động focus vào ô input khi chuyển sang câu mới
  useEffect(() => {
    if (showAnswer) return;

    const doFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    };

    doFocus();
    const t1 = setTimeout(doFocus, 50);
    const t2 = setTimeout(doFocus, 150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [segmentId, showAnswer]);

  const targetChunk = item.maskedChunks[0];
  if (!targetChunk) {
    return <p className="text-sm text-text-secondary">{item.originalText}</p>;
  }

  const words = item.originalText.split(/\s+/);
  const prefix = words.slice(0, targetChunk.startWordIndex).join(' ');
  const suffix = words.slice(targetChunk.endWordIndex).join(' ');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base sm:text-lg leading-loose font-medium text-text-primary">
        {prefix && <span className="select-text">{prefix}</span>}

        <div className="inline-flex flex-col items-center">
          <input
            ref={inputRef}
            type="text"
            autoFocus={!showAnswer}
            value={showAnswer ? targetChunk.cleanedText : userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEnterPress();
              }
            }}
            disabled={showAnswer}
            placeholder={showHint ? `Gợi ý: ${targetChunk.hint}` : `[ Gõ cụm ${targetChunk.text.split(/\s+/).length} từ còn thiếu... ]`}
            className={`min-w-[240px] sm:min-w-[320px] h-10 px-3 text-center text-sm sm:text-base font-bold rounded-xl border transition-all outline-hidden ${
              showAnswer || isCompleted
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                : 'bg-base border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-text-primary shadow-inner'
            }`}
          />
          {showHint && targetChunk.hint && (
            <span className="text-[11px] font-semibold text-amber-500 mt-1">
              💡 {targetChunk.hint}
            </span>
          )}
        </div>

        {suffix && <span className="select-text">{suffix}</span>}
      </div>
    </div>
  );
}
