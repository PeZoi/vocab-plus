'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bookmark, Check, Type, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WordQuickPopover } from './word-quick-popover';
import { useSaveImportedTextMutation } from '@/hooks/features/import/use-import-mutations';
import type { ReaderToken } from '@/utils/text-extractor';
import type { ReadingStats } from '@/types/imported-text.types';
import type { CardWithProgress } from '@/types/card.types';
import { cn } from '@/lib/utils';

interface InteractiveReaderProps {
  title: string;
  paragraphs: ReaderToken[][];
  readingStats: ReadingStats;
  selectedToken: ReaderToken | null;
  activeContextSentence: string;
  onSelectWord: (token: ReaderToken) => void;
  onClosePopover: () => void;
  isKnownWord: (cleanWord: string) => boolean;
  getKnownCardInfo: (cleanWord: string) => CardWithProgress | undefined;
  onBackToInput: () => void;
  rawText: string;
  textSelection?: { text: string; rect: DOMRect } | null;
  onTextSelection?: () => void;
}

export function InteractiveReader({
  title,
  paragraphs,
  readingStats,
  selectedToken,
  activeContextSentence,
  onSelectWord,
  onClosePopover,
  isKnownWord,
  getKnownCardInfo,
  onBackToInput,
  rawText,
  textSelection,
  onTextSelection,
}: InteractiveReaderProps) {
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(false);
  const { mutateAsync: saveArticle, isPending: isSaving } = useSaveImportedTextMutation();

  const handleSaveArticle = async () => {
    try {
      await saveArticle({
        title: title || 'Bài đọc không tên',
        raw_text: rawText,
      });
      setIsSavedLocally(true);
    } catch (err) {
      console.error('Lỗi khi lưu bài đọc:', err);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'md':
        return 'text-base leading-relaxed';
      case 'xl':
        return 'text-xl leading-loose';
      case 'lg':
      default:
        return 'text-lg leading-relaxed';
    }
  };

  return (
    <div className="space-y-4">
      {/* Reader Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-surface border border-border/70">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToInput}
            className="text-text-secondary hover:text-text-primary gap-1 px-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div>
            <h2 className="text-sm sm:text-base font-bold text-text-primary line-clamp-1 max-w-[200px] sm:max-w-md">
              {title || 'Bài đọc tương tác'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span>{readingStats.total_words} từ</span>
              <span>•</span>
              <span>~{readingStats.reading_time_minutes} phút đọc</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Toggle */}
          <div className="flex items-center bg-base rounded-lg border border-border/60 p-0.5">
            <button
              onClick={() => setFontSize(fontSize === 'lg' ? 'md' : fontSize === 'xl' ? 'lg' : 'xl')}
              className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 rounded transition-colors"
              title="Đổi cỡ chữ"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase font-mono text-[10px]">{fontSize}</span>
            </button>
          </div>



          {/* Save Article Button */}
          <Button
            type="button"
            variant={isSavedLocally ? 'ghost' : 'outline'}
            size="sm"
            onClick={handleSaveArticle}
            disabled={isSaving || isSavedLocally}
            className={cn(
              'rounded-lg text-xs gap-1.5 transition-all',
              isSavedLocally
                ? 'text-emerald-400 bg-emerald-500/10 border-transparent'
                : 'border-border bg-base hover:bg-surface-hover text-text-primary'
            )}
          >
            {isSavedLocally ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu bài'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Interactive Reading Canvas */}
      <div 
        className="p-6 sm:p-10 rounded-2xl bg-surface border border-border/80 shadow-xl space-y-6 relative"
        onMouseUp={onTextSelection}
      >
        {paragraphs.map((tokens, pIdx) => (
          <p
            key={pIdx}
            className={cn(
              'text-text-primary tracking-normal font-normal select-text',
              getFontSizeClass()
            )}
          >
            {tokens.map((token) => {
              if (!token.isWord) {
                return <span key={token.id}>{token.raw}</span>;
              }

              const isKnown = isKnownWord(token.clean);
              const isSelected = selectedToken?.id === token.id;

              return (
                <span
                  key={token.id}
                  onClick={() => onSelectWord(token)}
                  className={cn(
                    'cursor-pointer rounded px-0.5 transition-all inline-block duration-150',
                    isSelected
                      ? 'bg-brand/25 text-brand ring-1 ring-brand font-semibold shadow-xs'
                      : isKnown
                      ? 'text-emerald-300 font-medium hover:bg-emerald-500/15 decoration-emerald-500/40 underline decoration-dotted underline-offset-4'
                      : 'hover:text-brand hover:bg-brand/10 hover:shadow-xs'
                  )}
                >
                  {token.raw}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {/* Word Quick Popover Modal */}
      <WordQuickPopover
        key={selectedToken ? `${selectedToken.clean}-${selectedToken.id}` : 'empty-popover'}
        token={selectedToken}
        contextSentence={activeContextSentence}
        knownCard={selectedToken ? getKnownCardInfo(selectedToken.clean) : undefined}
        onClose={onClosePopover}
      />

      {/* Floating Action Button (Highlight-to-trigger) */}
      <AnimatePresence>
        {textSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed z-50 flex items-center"
            style={{
              top: Math.max(10, textSelection.rect.top - 54), // Cách text 1 đoạn ngắn, không lọt ngoài màn hình
              left: textSelection.rect.left + textSelection.rect.width / 2,
              transform: 'translateX(-50%)',
            }}
          >
            <Button
              size="sm"
              onClick={() => {
                const syntheticToken: ReaderToken = {
                  id: `phrase-${Date.now()}`,
                  raw: textSelection.text,
                  clean: textSelection.text,
                  isWord: true,
                  paragraphIndex: -1,
                };
                onSelectWord(syntheticToken);
              }}
              className="bg-brand text-white hover:bg-brand-hover rounded-full px-4 h-10 shadow-xl shadow-brand/20 border border-brand/50 gap-2 font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                Tra cứu &quot;
                {textSelection.text.length > 20
                  ? textSelection.text.substring(0, 20) + '...'
                  : textSelection.text}
                &quot;
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
