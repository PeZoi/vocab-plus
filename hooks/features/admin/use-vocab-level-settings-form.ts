'use client';

import {
  DEFAULT_VOCAB_LEVEL_SETTINGS,
  type LevelPenaltyRule,
  type LevelThresholdConfig,
  type VocabLevelSettings,
} from '@/types/system-settings.types';
import { useCallback, useMemo, useState } from 'react';

interface UseVocabLevelSettingsFormProps {
  initialConfig?: VocabLevelSettings;
  onSave: (config: VocabLevelSettings) => Promise<void>;
}

export function useVocabLevelSettingsForm({
  initialConfig,
  onSave,
}: UseVocabLevelSettingsFormProps) {
  const [config, setConfig] = useState<VocabLevelSettings>(
    initialConfig || DEFAULT_VOCAB_LEVEL_SETTINGS
  );
  const [prevInitial, setPrevInitial] = useState(initialConfig);

  if (initialConfig && initialConfig !== prevInitial) {
    setPrevInitial(initialConfig);
    setConfig(initialConfig);
  }

  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(initialConfig || DEFAULT_VOCAB_LEVEL_SETTINGS);
  }, [config, initialConfig]);

  const handleLevelChange = useCallback(
    (index: number, field: keyof LevelThresholdConfig, value: string | number) => {
      setConfig((prev) => {
        const nextLevels = [...prev.levels];
        nextLevels[index] = {
          ...nextLevels[index],
          [field]: value,
        };
        return {
          ...prev,
          levels: nextLevels,
        };
      });
    },
    []
  );

  const handlePenaltyRuleChange = useCallback((penaltyRule: LevelPenaltyRule) => {
    setConfig((prev) => ({ ...prev, penaltyRule }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_VOCAB_LEVEL_SETTINGS);
  }, []);

  const handleSave = useCallback(async () => {
    await onSave(config);
  }, [config, onSave]);

  return {
    config,
    isDirty,
    handleLevelChange,
    handlePenaltyRuleChange,
    handleReset,
    handleSave,
  };
}
