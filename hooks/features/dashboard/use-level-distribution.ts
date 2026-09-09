'use client';

import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import type { CardWithProgress } from '@/types/card.types';
import {
  DEFAULT_VOCAB_LEVEL_SETTINGS,
  type VocabLevelSettings,
} from '@/types/system-settings.types';
import { calculateWordLevel } from '@/utils/fsrs-level';
import { useMemo } from 'react';

export function useLevelDistribution(cards: CardWithProgress[]) {
  const { data: systemSettings = [] } = useSystemSettingsQuery();

  const levelConfig = useMemo<VocabLevelSettings>(() => {
    const setting = systemSettings.find((s) => s.key === 'vocab_level_config');
    if (setting?.value && typeof setting.value === 'object') {
      const val = setting.value as Partial<VocabLevelSettings>;
      if (Array.isArray(val.levels) && val.levels.length > 0) {
        return {
          penaltyRule: val.penaltyRule || DEFAULT_VOCAB_LEVEL_SETTINGS.penaltyRule,
          allowLevelUpInCasualMode: !!val.allowLevelUpInCasualMode,
          levels: val.levels,
        };
      }
    }
    return DEFAULT_VOCAB_LEVEL_SETTINGS;
  }, [systemSettings]);

  // Thống kê phân bổ từ vựng theo Level 0 -> 5
  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const card of cards) {
      const lvlInfo = calculateWordLevel(card.user_card, levelConfig);
      counts[lvlInfo.level] = (counts[lvlInfo.level] || 0) + 1;
    }
    return counts;
  }, [cards, levelConfig]);

  const totalCards = cards.length;
  const maxCount = Math.max(...Object.values(levelCounts), 1);
  const ancientCount = levelCounts[5] || 0;

  return {
    levelConfig,
    levelCounts,
    totalCards,
    maxCount,
    ancientCount,
  };
}
