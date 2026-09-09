import { useState, useEffect, useMemo, useCallback } from 'react';
import type { QuestTemplate } from '@/types/quest.types';

export const DEFAULT_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'quest_review_30',
    quest_type: 'review_cards',
    title: 'Hoàn thành 30 thẻ ôn tập',
    target: 30,
    reward_xp: 25,
    is_active: true,
    description: 'Ôn tập tối thiểu 30 thẻ từ vựng trong ngày',
  },
  {
    id: 'quest_learn_10',
    quest_type: 'learn_new',
    title: 'Học 10 từ vựng mới',
    target: 10,
    reward_xp: 30,
    is_active: true,
    description: 'Thêm hoặc học lần đầu 10 từ mới',
  },
  {
    id: 'quest_earn_100',
    quest_type: 'earn_xp',
    title: 'Đạt 100 XP trong ngày',
    target: 100,
    reward_xp: 20,
    is_active: true,
    description: 'Tích lũy tối thiểu 100 XP từ các hoạt động học',
  },
];

interface UseQuestSettingsProps {
  initialTemplates?: QuestTemplate[];
  onSave: (templates: QuestTemplate[]) => Promise<void>;
}

export function useQuestSettings({ initialTemplates, onSave }: UseQuestSettingsProps) {
  const [templates, setTemplates] = useState<QuestTemplate[]>(() => {
    if (initialTemplates && Array.isArray(initialTemplates) && initialTemplates.length > 0) {
      return initialTemplates;
    }
    return DEFAULT_QUEST_TEMPLATES;
  });

  useEffect(() => {
    if (initialTemplates && Array.isArray(initialTemplates) && initialTemplates.length > 0) {
      setTemplates(initialTemplates);
    }
  }, [initialTemplates]);

  const isDirty = useMemo(() => {
    const base = initialTemplates && initialTemplates.length > 0 ? initialTemplates : DEFAULT_QUEST_TEMPLATES;
    return JSON.stringify(templates) !== JSON.stringify(base);
  }, [templates, initialTemplates]);

  const handleAddQuest = useCallback(() => {
    const newQuest: QuestTemplate = {
      id: `quest_${Date.now()}`,
      quest_type: 'review_cards',
      title: 'Nhiệm vụ mới',
      target: 20,
      reward_xp: 20,
      is_active: true,
    };
    setTemplates((prev) => [...prev, newQuest]);
  }, []);

  const handleRemoveQuest = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleUpdateQuest = useCallback((id: string, updates: Partial<QuestTemplate>) => {
    setTemplates((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const handleReset = useCallback(() => {
    setTemplates(DEFAULT_QUEST_TEMPLATES);
  }, []);

  const handleSaveClick = useCallback(async () => {
    await onSave(templates);
  }, [onSave, templates]);

  return {
    templates,
    isDirty,
    handleAddQuest,
    handleRemoveQuest,
    handleUpdateQuest,
    handleReset,
    handleSaveClick,
  };
}
