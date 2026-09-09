'use client';

import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import type { UserCard } from '@/types/card.types';
import {
  DEFAULT_VOCAB_LEVEL_SETTINGS,
  type VocabLevelSettings,
} from '@/types/system-settings.types';
import { calculateWordLevel } from '@/utils/fsrs-level';
import { useMemo } from 'react';

interface UseWordLevelInfoParams {
  userCard?: UserCard | null;
  directLevel?: number;
}

export function useWordLevelInfo({ userCard, directLevel }: UseWordLevelInfoParams) {
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

  // Nếu truyền directLevel thì tạo mock userCard
  const effectiveUserCard: UserCard | null | undefined = useMemo(() => {
    if (directLevel !== undefined) {
      const targetLvl = levelConfig.levels.find((l) => l.level === directLevel);
      return {
        id: 'mock',
        card_id: 'mock',
        user_id: 'mock',
        stability: targetLvl?.minStabilityDays || directLevel * 5,
        difficulty: 5,
        due_at: new Date().toISOString(),
        review_count: targetLvl?.minConsecutiveCorrect || directLevel * 2,
        lapse_count: 0,
        is_leech: false,
        state: directLevel === 0 ? 'new' : 'review',
      };
    }
    return userCard;
  }, [directLevel, userCard, levelConfig]);

  const levelInfo = useMemo(() => {
    return calculateWordLevel(effectiveUserCard, levelConfig);
  }, [effectiveUserCard, levelConfig]);

  return levelInfo;
}
