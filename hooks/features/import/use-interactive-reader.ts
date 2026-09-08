'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  tokenizeTextForReader,
  extractSentenceAroundWord,
  calculateReadingStats,
  type ReaderToken,
} from '@/utils/text-extractor';
import { getBaseWordCandidates } from '@/utils/lemmatizer';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { useQuickSaveWord } from './use-quick-save-word';

export function useInteractiveReader(initialText: string = '', initialTitle: string = '') {
  const [text, setText] = useState<string>(initialText);
  const [title, setTitle] = useState<string>(initialTitle);
  const [selectedToken, setSelectedToken] = useState<ReaderToken | null>(null);
  const [textSelection, setTextSelection] = useState<{ text: string; rect: DOMRect } | null>(null);

  // Lấy toàn bộ từ vựng hiện có của user
  const { data: cards = [], isLoading: isLoadingCards } = useCardsQuery();
  const { isWordRecentlySaved } = useQuickSaveWord();

  // Tạo Map từ vựng đã học để tra cứu O(1) (Bao gồm cả từ gốc và các từ trong họ từ word_family)
  const knownWordsMap = useMemo(() => {
    const map = new Map<string, (typeof cards)[0]>();
    cards.forEach((card) => {
      if (card.word) {
        const baseWord = card.word.toLowerCase().trim();
        map.set(baseWord, card);

        // Ánh xạ thêm các từ trong word_family nếu có
        if (card.word_family && Array.isArray(card.word_family)) {
          card.word_family.forEach((wf: unknown) => {
            const familyWord =
              typeof wf === 'string'
                ? wf
                : typeof wf === 'object' && wf !== null && 'word' in wf
                ? (wf as { word: string }).word
                : '';
            if (typeof familyWord === 'string') {
              const cleanFamily = familyWord.toLowerCase().trim();
              if (cleanFamily && !map.has(cleanFamily)) {
                map.set(cleanFamily, card);
              }
            }
          });
        }
      }
    });
    return map;
  }, [cards]);

  // Kiểm tra xem một từ (hoặc các biến thể thì/dạng số nhiều/bất quy tắc của nó) đã có trong kho từ chưa
  const isKnownWord = useCallback(
    (cleanWord: string) => {
      if (!cleanWord) return false;
      const lower = cleanWord.toLowerCase().trim();
      
      // 1. Kiểm tra trực tiếp
      if (knownWordsMap.has(lower) || isWordRecentlySaved(lower)) {
        return true;
      }

      // 2. Kiểm tra qua các ứng viên từ gốc (Lemmatizer)
      const candidates = getBaseWordCandidates(lower);
      for (const candidate of candidates) {
        if (knownWordsMap.has(candidate) || isWordRecentlySaved(candidate)) {
          return true;
        }
      }

      return false;
    },
    [knownWordsMap, isWordRecentlySaved]
  );

  // Lấy thông tin thẻ đã lưu của từ (trực tiếp hoặc thông qua từ gốc)
  const getKnownCardInfo = useCallback(
    (cleanWord: string) => {
      if (!cleanWord) return undefined;
      const lower = cleanWord.toLowerCase().trim();

      // 1. Khớp trực tiếp
      const directCard = knownWordsMap.get(lower);
      if (directCard) return directCard;

      // 2. Khớp qua từ gốc (Lemmatizer)
      const candidates = getBaseWordCandidates(lower);
      for (const candidate of candidates) {
        const candidateCard = knownWordsMap.get(candidate);
        if (candidateCard) return candidateCard;
      }

      return undefined;
    },
    [knownWordsMap]
  );

  // Tokenize văn bản thành mảng các đoạn
  const paragraphs = useMemo(() => {
    return tokenizeTextForReader(text);
  }, [text]);

  // Thống kê bài đọc
  const readingStats = useMemo(() => {
    return calculateReadingStats(text);
  }, [text]);

  // Trích xuất câu ngữ cảnh của từ đang chọn
  const activeContextSentence = useMemo(() => {
    if (!selectedToken || !selectedToken.clean) return '';
    return extractSentenceAroundWord(text, selectedToken.clean);
  }, [text, selectedToken]);

  const handleSelectWord = useCallback((token: ReaderToken) => {
    if (!token.isWord) return;
    setSelectedToken(token);
    setTextSelection(null); // Xóa selection hiển thị nếu có
  }, []);

  const handleClosePopover = useCallback(() => {
    setSelectedToken(null);
  }, []);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setTextSelection(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setTextSelection(null);
      return;
    }

    // Giới hạn độ dài, không tra cứu quá 100 ký tự (chống chọn cả đoạn văn dài)
    if (selectedText.length > 100) {
      setTextSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      setTextSelection(null);
      return;
    }

    setTextSelection({ text: selectedText, rect });
  }, []);

  // Tự động clear popover highlight nếu click chỗ khác làm mất selection
  useEffect(() => {
    const handleDocumentMouseDown = () => {
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
    text,
    setText,
    title,
    setTitle,
    paragraphs,
    readingStats,
    selectedToken,
    activeContextSentence,
    handleSelectWord,
    handleClosePopover,
    isKnownWord,
    getKnownCardInfo,
    isLoadingCards,
    textSelection,
    setTextSelection,
    handleTextSelection,
  };
}
