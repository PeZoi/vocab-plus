'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  tokenizeTextForReader,
  extractSentenceAroundWord,
  calculateReadingStats,
  type ReaderToken,
} from '@/utils/text-extractor';
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

  // Tạo Map từ vựng đã học để tra cứu O(1)
  const knownWordsMap = useMemo(() => {
    const map = new Map<string, (typeof cards)[0]>();
    cards.forEach((card) => {
      if (card.word) {
        map.set(card.word.toLowerCase().trim(), card);
      }
    });
    return map;
  }, [cards]);

  // Kiểm tra xem một từ đã có trong kho từ (hoặc vừa lưu xong) chưa
  const isKnownWord = useCallback(
    (cleanWord: string) => {
      if (!cleanWord) return false;
      const lower = cleanWord.toLowerCase().trim();
      return knownWordsMap.has(lower) || isWordRecentlySaved(lower);
    },
    [knownWordsMap, isWordRecentlySaved]
  );

  // Lấy thông tin thẻ đã lưu của từ
  const getKnownCardInfo = useCallback(
    (cleanWord: string) => {
      if (!cleanWord) return undefined;
      return knownWordsMap.get(cleanWord.toLowerCase().trim());
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
