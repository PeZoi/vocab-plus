'use client';

import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import type { CardWithProgress } from '@/types/card.types';
import { calculateWordSimilarity } from '@/utils/text-similarity';
import { useMemo } from 'react';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  threshold: number;
  matchedCard: CardWithProgress | null;
}

/**
 * Hook kiểm tra độ tương đồng của từ vựng mới với kho từ cá nhân của người dùng
 * Tuân thủ quy chuẩn DRY, tận dụng TanStack Query cache (phản hồi tức thì 0ms)
 */
export function useWordDuplicateCheck() {
  const { data: cards = [] } = useCardsQuery();
  const { data: settings = [] } = useSystemSettingsQuery();

  // Đọc ngưỡng threshold từ cài đặt hệ thống (mặc định 80%)
  const threshold = useMemo(() => {
    const forkSetting = settings.find((s) => s.key === 'fork_similarity_threshold');
    if (forkSetting?.value && typeof forkSetting.value === 'object') {
      const valObj = forkSetting.value as Record<string, unknown>;
      if (typeof valObj.threshold === 'number') {
        return Math.max(50, Math.min(100, Math.round(valObj.threshold)));
      }
    }
    return 80;
  }, [settings]);

  /**
   * So sánh từ mới với tất cả các từ trong kho của user
   */
  const checkDuplicate = (newWord: string): DuplicateCheckResult => {
    const trimmed = newWord?.trim();
    if (!trimmed || cards.length === 0) {
      return {
        isDuplicate: false,
        similarity: 0,
        threshold,
        matchedCard: null,
      };
    }

    let bestMatch: CardWithProgress | null = null;
    let maxSimilarity = 0;

    for (const card of cards) {
      const sim = calculateWordSimilarity(trimmed, card.word);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        bestMatch = card;
      }
      // Nếu trùng tuyệt đối 100% thì dừng sớm
      if (maxSimilarity === 100) break;
    }

    const isDuplicate = maxSimilarity >= threshold && bestMatch !== null;

    return {
      isDuplicate,
      similarity: maxSimilarity,
      threshold,
      matchedCard: bestMatch,
    };
  };

  return {
    checkDuplicate,
    threshold,
    cardsCount: cards.length,
  };
}
