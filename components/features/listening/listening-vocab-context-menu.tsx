'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { ListeningTextSelection } from '@/hooks/features/listening/use-listening-vocab-selection';

interface ListeningVocabContextMenuProps {
  textSelection: ListeningTextSelection | null;
  onAddVocabulary: (word: string, contextSentence: string) => void;
}

export function ListeningVocabContextMenu({
  textSelection,
  onAddVocabulary,
}: ListeningVocabContextMenuProps) {
  if (!textSelection) return null;

  const displayText =
    textSelection.text.length > 20
      ? textSelection.text.slice(0, 20) + '...'
      : textSelection.text;

  return (
    <AnimatePresence>
      <motion.div
        data-vocab-context-menu="true"
        initial={{ opacity: 0, y: 8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.92 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed z-50 flex items-center pointer-events-auto"
        style={{
          top: Math.max(10, textSelection.rect.top - 46),
          left: textSelection.rect.left + textSelection.rect.width / 2,
          transform: 'translateX(-50%)',
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            // Ngăn chặn sự kiện mousedown làm mất vùng bôi đen của browser
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddVocabulary(textSelection.text, textSelection.contextSentence);
          }}
          className="h-9 px-3.5 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xl shadow-brand/25 border border-brand/50 cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          title={`Thêm từ vựng "${textSelection.text}" vào kho thẻ với AI detect`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Thêm từ vựng &quot;{displayText}&quot;</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
