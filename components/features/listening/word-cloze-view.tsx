'use client';

import React, { useRef, useEffect } from 'react';
import type { WordClozeItem } from '@/types/listening.types';

interface WordClozeViewProps {
  items: WordClozeItem[];
  segmentId?: string;
  showHint: boolean;
  showAnswer: boolean;
  onAnswerChange: (wordIndex: number, value: string) => void;
  onEnterPress: () => void;
}

export function WordClozeView({
  items,
  segmentId,
  showHint,
  showAnswer,
  onAnswerChange,
  onEnterPress,
}: WordClozeViewProps) {
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // Danh sách các từ bị khoét lỗ để điều hướng Tab tuần tự
  const maskedItems = items.filter((item) => item.isMasked);
  const firstMaskedIndex = maskedItems[0]?.index;

  // Tự động focus vào ô input đầu tiên khi chuyển sang câu mới
  useEffect(() => {
    if (showAnswer || firstMaskedIndex === undefined) return;

    const doFocus = () => {
      const firstInput = inputRefs.current.get(firstMaskedIndex);
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    };

    doFocus();
    const t1 = setTimeout(doFocus, 50);
    const t2 = setTimeout(doFocus, 150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [segmentId, firstMaskedIndex, showAnswer]);

  if (!items || items.length === 0) {
    return (
      <div className="text-text-secondary text-sm italic py-2 animate-pulse">
        Đang chuẩn bị câu hỏi điền từ...
      </div>
    );
  }

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentWordIndex: number
  ) => {
    // Phím Enter: Kiểm tra kết quả
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterPress();
      return;
    }

    // Phím Tab: Di chuyển mượt mà giữa các ô input điền từ
    if (e.key === 'Tab') {
      e.preventDefault();
      if (maskedItems.length <= 1) return;

      const currentPos = maskedItems.findIndex((it) => it.index === currentWordIndex);
      if (currentPos === -1) return;

      if (!e.shiftKey) {
        // Tab: Chuyển sang ô input tiếp theo (vòng tròn về ô đầu)
        const nextPos = (currentPos + 1) % maskedItems.length;
        const nextItem = maskedItems[nextPos];
        const nextInput = inputRefs.current.get(nextItem.index);
        nextInput?.focus();
        nextInput?.select();
      } else {
        // Shift + Tab: Lùi về ô input trước đó (vòng tròn về ô cuối)
        const prevPos = (currentPos - 1 + maskedItems.length) % maskedItems.length;
        const prevItem = maskedItems[prevPos];
        const prevInput = inputRefs.current.get(prevItem.index);
        prevInput?.focus();
        prevInput?.select();
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base sm:text-lg leading-loose font-medium text-text-primary">
      {items.map((item) => {
        if (!item.isMasked) {
          return (
            <span key={item.index} className="select-text">
              {item.originalWord}
            </span>
          );
        }

        const isCorrect = item.isCorrect;
        const widthCh = Math.max(item.cleanedWord.length + 2, 7);
        const isFirstMasked = item.index === firstMaskedIndex;

        // Bóc tách dấu câu ở cuối (nếu có) để người dùng không phải gõ kèm dấu câu
        const punctMatch = item.originalWord.match(/[^\w\s]+$/);
        const trailingPunct = punctMatch ? punctMatch[0] : '';

        return (
          <div key={item.index} className="inline-flex items-baseline gap-0.5">
            <div className="inline-flex flex-col items-center relative group">
              <input
                ref={(el) => {
                  if (el) inputRefs.current.set(item.index, el);
                  else inputRefs.current.delete(item.index);
                }}
                type="text"
                autoFocus={isFirstMasked && !showAnswer}
                value={showAnswer ? item.cleanedWord : item.userAnswer || ''}
                onChange={(e) => onAnswerChange(item.index, e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, item.index)}
                style={{ width: `${widthCh}ch` }}
                disabled={showAnswer}
                placeholder={showHint ? `${item.hint?.firstLetter}...` : `(${item.hint?.length} chữ)`}
                className={`h-9 px-2 text-center text-sm sm:text-base font-bold font-mono rounded-xl border transition-all outline-hidden ${
                  showAnswer
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                    : isCorrect === true
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-xs'
                    : isCorrect === false
                    ? 'bg-red-500/15 border-red-500 text-red-500 animate-shake'
                    : 'bg-base border-brand/40 focus:border-brand focus:ring-1 focus:ring-brand text-text-primary shadow-inner'
                }`}
              />

              {/* Hint tooltip khi rê chuột hoặc bật showHint */}
              {showHint && item.hint && !showAnswer && (
                <span className="text-[10px] font-mono text-brand font-bold mt-0.5 whitespace-nowrap">
                  Bắt đầu: {item.hint.firstLetter} ({item.hint.length} ký tự)
                </span>
              )}
            </div>

            {trailingPunct && (
              <span className="font-semibold text-text-primary select-none">{trailingPunct}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
