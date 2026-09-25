'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ReaderToken } from '@/utils/text-extractor';
import { getBaseWordCandidates } from '@/utils/lemmatizer';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import type { CardWithProgress } from '@/types/card.types';

export interface ListeningTextSelection {
  text: string;
  rect: DOMRect;
  contextSentence: string;
}

interface UseListeningVocabSelectionOptions {
  currentSegmentText?: string;
}

export function useListeningVocabSelection({
  currentSegmentText = '',
}: UseListeningVocabSelectionOptions = {}) {
  const [textSelection, setTextSelection] = useState<ListeningTextSelection | null>(null);
  const [activeToken, setActiveToken] = useState<ReaderToken | null>(null);
  const [activeContextSentence, setActiveContextSentence] = useState<string>('');

  // 1. Lấy toàn bộ thẻ từ vựng hiện có của user
  const { data: cards = [] } = useCardsQuery();

  // 2. Tạo Map từ vựng để tra cứu nhanh O(1)
  const knownWordsMap = useMemo(() => {
    const map = new Map<string, CardWithProgress>();
    cards.forEach((card) => {
      if (card.word) {
        const baseWord = card.word.toLowerCase().trim();
        map.set(baseWord, card as unknown as CardWithProgress);

        // Ánh xạ họ từ nếu có
        if (card.word_family && Array.isArray(card.word_family)) {
          card.word_family.forEach((wf: unknown) => {
            const familyWord =
              typeof wf === 'string'
                ? wf
                : typeof wf === 'object' && wf !== null && 'word' in wf
                ? (wf as { word: string }).word
                : '';
            if (typeof familyWord === 'string') {
              const clean = familyWord.toLowerCase().trim();
              if (clean && !map.has(clean)) {
                map.set(clean, card as unknown as CardWithProgress);
              }
            }
          });
        }
      }
    });
    return map;
  }, [cards]);

  // Kiểm tra từ đã có trong kho chưa
  const isKnownWord = useCallback(
    (cleanWord: string) => {
      if (!cleanWord) return false;
      const lower = cleanWord.toLowerCase().trim();
      if (knownWordsMap.has(lower)) return true;

      const candidates = getBaseWordCandidates(lower);
      for (const candidate of candidates) {
        if (knownWordsMap.has(candidate)) return true;
      }
      return false;
    },
    [knownWordsMap]
  );

  // Lấy thông tin thẻ đã lưu của từ
  const getKnownCardInfo = useCallback(
    (cleanWord: string) => {
      if (!cleanWord) return undefined;
      const lower = cleanWord.toLowerCase().trim();
      const direct = knownWordsMap.get(lower);
      if (direct) return direct;

      const candidates = getBaseWordCandidates(lower);
      for (const candidate of candidates) {
        const match = knownWordsMap.get(candidate);
        if (match) return match;
      }
      return undefined;
    },
    [knownWordsMap]
  );

  // Xử lý sự kiện bôi đen (selection) trên màn hình luyện nghe
  const handleTextSelection = useCallback(
    (customContextSentence?: string) => {
      const selection = typeof window !== 'undefined' ? window.getSelection() : null;
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setTextSelection(null);
        return;
      }

      const rawText = selection.toString().trim();
      // Loại bỏ ký tự thừa hoặc dấu câu ở đầu/cuối
      const cleanText = rawText.replace(/^[^\w]+|[^\w]+$/g, '');

      if (!cleanText || cleanText.length > 80) {
        setTextSelection(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setTextSelection(null);
        return;
      }

      // Xác định câu ngữ cảnh: ưu tiên tham số truyền vào hoặc câu của segment hiện tại
      let context = customContextSentence || currentSegmentText;

      // Nếu không có, thử tìm element cha có data-sentence
      if (!context && range.commonAncestorContainer) {
        const parentElem =
          range.commonAncestorContainer instanceof HTMLElement
            ? range.commonAncestorContainer
            : range.commonAncestorContainer.parentElement;
        const sentenceElem = parentElem?.closest('[data-sentence]');
        if (sentenceElem) {
          context = sentenceElem.getAttribute('data-sentence') || '';
        }
      }

      setTextSelection({
        text: cleanText,
        rect,
        contextSentence: context || cleanText,
      });
    },
    [currentSegmentText]
  );

  // Mở popup tra cứu / thêm từ vựng với AI detect theo context nguyên câu
  const handleOpenVocabPopover = useCallback(
    (word: string, contextSentence?: string) => {
      const clean = word.trim().replace(/^[^\w]+|[^\w]+$/g, '');
      if (!clean) return;

      const syntheticToken: ReaderToken = {
        id: `listening-${Date.now()}`,
        raw: clean,
        clean,
        isWord: true,
        paragraphIndex: -1,
      };

      setActiveToken(syntheticToken);
      setActiveContextSentence(contextSentence || currentSegmentText || clean);
      setTextSelection(null);
    },
    [currentSegmentText]
  );

  // Đóng popup
  const handleCloseVocabPopover = useCallback(() => {
    setActiveToken(null);
    setActiveContextSentence('');
  }, []);

  // Xóa selection floating button khi click ra ngoài
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Không ẩn nếu click vào chính nút context menu
      if (target?.closest('[data-vocab-context-menu]')) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTextSelection(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, []);

  return {
    textSelection,
    setTextSelection,
    activeToken,
    activeContextSentence,
    handleTextSelection,
    handleOpenVocabPopover,
    handleCloseVocabPopover,
    isKnownWord,
    getKnownCardInfo,
  };
}
