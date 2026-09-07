'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Layers, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';

interface VocabPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWords: string[];
  onSelectWords: (words: string[]) => void;
  maxSelect?: number;
}

const CEFR_TABS: Array<{ label: string; value: string }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
];

export function VocabPickerModal({
  isOpen,
  onClose,
  selectedWords,
  onSelectWords,
  maxSelect = 10,
}: VocabPickerModalProps) {
  const { data: cards = [], isLoading } = useCardsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [tempSelected, setTempSelected] = useState<Set<string>>(() => new Set(selectedWords));
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Đồng bộ lại state khi modal được mở ra
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTempSelected(new Set(selectedWords));
      setSearchTerm('');
    }
  }


  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchSearch =
        searchTerm === '' ||
        card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.definition && card.definition.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLevel = selectedLevel === 'all' || card.cefr_level === selectedLevel;

      return matchSearch && matchLevel;
    });
  }, [cards, searchTerm, selectedLevel]);

  const handleToggle = (word: string) => {
    setTempSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        if (next.size >= maxSelect) {
          return next;
        }
        next.add(word);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onSelectWords(Array.from(tempSelected));
    onClose();
  };

  const handleClearAll = () => {
    setTempSelected(new Set());
  };

  if (!isOpen) return null;

  const isMaxReached = tempSelected.size >= maxSelect;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between gap-3 bg-base/40">
            <div>
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand" />
                <span>Chọn Từ Vựng Trong Kho</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 font-mono font-semibold">
                  {tempSelected.size}/{maxSelect} từ
                </span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                AI sẽ lồng ghép các từ này vào câu chuyện để bạn ôn tập ngữ cảnh thực tế
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & CEFR filter */}
          <div className="p-4 border-b border-border/40 space-y-3 bg-base/20">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Tìm kiếm theo từ vựng hoặc định nghĩa..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-base border border-border text-text-primary placeholder:text-text-secondary/50 text-sm focus:border-brand transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Level filter tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CEFR_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedLevel(tab.value)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
                    selectedLevel === tab.value
                      ? 'bg-brand text-white'
                      : 'bg-base text-text-secondary hover:text-text-primary border border-border/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isMaxReached && (
              <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Bạn đã chọn tối đa {maxSelect} từ để đảm bảo câu chuyện tự nhiên nhất.</span>
              </div>
            )}
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-border/30 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-text-secondary">
                Đang tải kho từ vựng của bạn...
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-secondary">
                {cards.length === 0
                  ? 'Kho từ vựng của bạn hiện đang trống. Hãy thêm một vài từ trước nhé!'
                  : 'Không tìm thấy từ vựng nào khớp với bộ lọc.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredCards.map((card) => {
                  const isChecked = tempSelected.has(card.word);
                  const isDisabled = !isChecked && isMaxReached;

                  return (
                    <div
                      key={card.id}
                      onClick={() => !isDisabled && handleToggle(card.word)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2.5 ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed border-border/40 bg-surface/40'
                          : isChecked
                            ? 'bg-brand/10 border-brand/50 cursor-pointer shadow-xs'
                            : 'bg-surface hover:bg-surface-hover border-border/70 hover:border-brand/30 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-text-primary truncate">
                            {card.word}
                          </span>
                          {card.cefr_level && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-base text-brand border border-brand/20">
                              {card.cefr_level}
                            </span>
                          )}
                          {card.part_of_speech && (
                            <span className="text-[10px] italic text-text-secondary">
                              ({card.part_of_speech})
                            </span>
                          )}
                        </div>
                        {card.definition && (
                          <p className="text-xs text-text-secondary line-clamp-1 mt-1">
                            {card.definition}
                          </p>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 mt-0.5 ${
                          isChecked
                            ? 'bg-brand border-brand text-white'
                            : 'border-border bg-base'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/60 bg-base/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {tempSelected.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-text-secondary hover:text-danger transition-colors underline"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm border-border bg-surface hover:bg-surface-hover"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl text-sm bg-brand hover:bg-brand-hover text-white font-medium shadow-xs"
              >
                Xác nhận ({tempSelected.size} từ)
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
