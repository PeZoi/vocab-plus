'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BookmarkPlus, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { cardsService } from '@/services/cards.service';
import { aiService } from '@/services/ai.service';
import type { CreateCardDto, PartOfSpeech } from '@/types/card.types';

interface SaveToFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWord?: string;
  sentence: string;
  vietnameseTranslation?: string;
  podcastTitle?: string;
}

const POS_OPTIONS: { label: string; value: PartOfSpeech }[] = [
  { label: 'Danh từ (n)', value: 'noun' },
  { label: 'Động từ (v)', value: 'verb' },
  { label: 'Tính từ (adj)', value: 'adjective' },
  { label: 'Trạng từ (adv)', value: 'adverb' },
  { label: 'Cụm từ / Khác', value: 'noun' },
];

export function SaveToFlashcardModal({
  isOpen,
  onClose,
  defaultWord = '',
  sentence,
  vietnameseTranslation = '',
  podcastTitle,
}: SaveToFlashcardModalProps) {
  const [word, setWord] = useState(defaultWord);
  const [definition, setDefinition] = useState('');
  const [ipa, setIpa] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const clean = defaultWord.trim().replace(/^[^\w]+|[^\w]+$/g, '');
      setWord(clean);
      setDefinition('');
      setIpa('');
      setPartOfSpeech('noun');

      // Tự động phân tích từ nhanh bằng AI nếu có từ hợp lệ
      if (clean && clean.length >= 2) {
        setIsAnalyzing(true);
        aiService
          .analyzeWord(clean, sentence)
          .then((res) => {
            if (res && res.senses && res.senses.length > 0) {
              const bestSense = res.senses[0];
              setDefinition(bestSense.definition || '');
              if (bestSense.part_of_speech) {
                setPartOfSpeech(bestSense.part_of_speech);
              }
              if (res.ipa) {
                setIpa(res.ipa);
              }
            }
          })
          .catch(() => {
            // Không chặn nếu AI fail
          })
          .finally(() => {
            setIsAnalyzing(false);
          });
      }
    }
  }, [isOpen, defaultWord, sentence]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      toast.error('Vui lòng nhập từ vựng.');
      return;
    }
    if (!definition.trim()) {
      toast.error('Vui lòng nhập nghĩa tiếng Việt.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateCardDto = {
        word: word.trim(),
        definition: definition.trim(),
        ipa: ipa.trim() || null,
        part_of_speech: partOfSpeech,
        example_sentence: sentence,
        example_translation: vietnameseTranslation || null,
        tags: ['#listening', '#podcast'],
        source_type: 'manual',
        card_type: 'word',
        force: true,
      };

      await cardsService.createCard(payload);
      toast.success(`Đã thêm "${word.trim()}" vào bộ thẻ SRS!`, {
        description: 'Từ vựng này đã được thuật toán FSRS lên lịch ôn tập tại mục Ôn tập.',
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tạo thẻ từ vựng';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSave} className="space-y-4 select-none">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
          <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
            <BookmarkPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Lưu từ vựng vào Flashcard SRS
            </h3>
            <p className="text-xs text-text-secondary">
              Gắn ngữ cảnh câu podcast đang nghe vào thuật toán FSRS
            </p>
          </div>
        </div>

        {/* Word & IPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Từ / Cụm từ vựng <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. hydrate"
                required
                className="w-full h-10 px-3 rounded-xl bg-base border border-border text-sm text-text-primary focus:outline-none focus:border-brand transition-colors font-medium"
              />
              {isAnalyzing && (
                <div className="absolute right-3 top-2.5 text-brand animate-spin">
                  <Loader2 className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Phiên âm IPA
            </label>
            <input
              type="text"
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              placeholder="e.g. /ˈhaɪ.dreɪt/"
              className="w-full h-10 px-3 rounded-xl bg-base border border-border text-sm text-text-primary focus:outline-none focus:border-brand transition-colors font-mono"
            />
          </div>
        </div>

        {/* POS & Definition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Từ loại
            </label>
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
              className="w-full h-10 px-3 rounded-xl bg-base border border-border text-sm text-text-primary focus:outline-none focus:border-brand transition-colors cursor-pointer"
            >
              {POS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Định nghĩa tiếng Việt <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="e.g. cung cấp nước, giữ ẩm"
              required
              className="w-full h-10 px-3 rounded-xl bg-base border border-border text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Context Sentence Preview */}
        <div className="p-3.5 rounded-xl bg-base/80 border border-border/80 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-brand font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ngữ cảnh câu podcast:</span>
          </div>
          <p className="text-text-primary font-medium italic leading-relaxed">
            &ldquo;{sentence}&rdquo;
          </p>
          {vietnameseTranslation && (
            <p className="text-text-secondary leading-relaxed pt-0.5">
              Dịch: {vietnameseTranslation}
            </p>
          )}
          {podcastTitle && (
            <div className="text-[10px] text-text-secondary/70 pt-1 border-t border-border/50">
              Nguồn: {podcastTitle}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-xs font-medium transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={isSaving || !word.trim() || !definition.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand to-brand-hover text-white text-xs font-bold shadow-md shadow-brand/20 hover:shadow-brand/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Thêm Vào Flashcard FSRS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
