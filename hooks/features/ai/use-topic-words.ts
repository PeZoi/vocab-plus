'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { cardsService } from '@/services/cards.service';
import { cardKeys } from '@/constants/query-keys';
import { toast } from 'sonner';
import type {
  GenerateTopicWordsRequest,
  GenerateTopicWordsResponse,
  BulkCreateCardsResponse,
  TopicGeneratedWord,
} from '@/types/ai-topic.types';
import type { CEFRLevel, CreateCardDto } from '@/types/card.types';

export function useGenerateTopicWordsMutation() {
  return useMutation<GenerateTopicWordsResponse, Error, GenerateTopicWordsRequest>({
    mutationFn: (payload) => aiService.generateTopicWords(payload),
  });
}

export function useBulkCreateCardsMutation() {
  const queryClient = useQueryClient();

  return useMutation<BulkCreateCardsResponse, Error, CreateCardDto[]>({
    mutationFn: (cards) => cardsService.bulkCreateCards(cards),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      toast.success(data.message || `Đã lưu thành công ${data.created_count} từ vựng!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Không thể lưu từ vựng vào kho');
    },
  });
}

export function useTopicWordsGenerator(onSavedSuccess?: () => void) {
  const [topicInput, setTopicInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [selectedCefrLevels, setSelectedCefrLevels] = useState<CEFRLevel[]>([]);
  const [wordCount, setWordCount] = useState<number>(12);

  const [generatedData, setGeneratedData] = useState<GenerateTopicWordsResponse | null>(null);
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<Record<number, boolean>>({});

  const generateMutation = useGenerateTopicWordsMutation();
  const bulkCreateMutation = useBulkCreateCardsMutation();

  const toggleCefrLevel = (level: CEFRLevel) => {
    setSelectedCefrLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearCefrLevels = () => {
    setSelectedCefrLevels([]);
  };

  const handleGenerate = async () => {
    if (!topicInput.trim()) {
      toast.error('Vui lòng nhập tên chủ đề từ vựng!');
      return;
    }

    try {
      const res = await generateMutation.mutateAsync({
        topic: topicInput.trim(),
        description: descriptionInput.trim() || undefined,
        cefr_levels: selectedCefrLevels,
        count: wordCount,
      });

      setGeneratedData(res);

      // Mặc định chọn tất cả các từ CHƯA có trong kho
      const initialSelection: Record<number, boolean> = {};
      res.words.forEach((w, idx) => {
        initialSelection[idx] = !w.is_existing;
      });
      setSelectedWordIndexes(initialSelection);
    } catch (err: unknown) {
      console.error('Lỗi khi sinh từ vựng theo chủ đề:', err);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedWordIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const selectedCount = Object.values(selectedWordIndexes).filter(Boolean).length;
  const totalCount = generatedData?.words.length || 0;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedWordIndexes({});
    } else {
      const all: Record<number, boolean> = {};
      generatedData?.words.forEach((_, idx) => {
        all[idx] = true;
      });
      setSelectedWordIndexes(all);
    }
  };

  const handleSaveSelected = async () => {
    if (!generatedData || selectedCount === 0) {
      toast.error('Vui lòng chọn ít nhất một từ vựng để lưu!');
      return;
    }

    const cardsToSave: CreateCardDto[] = [];

    generatedData.words.forEach((item: TopicGeneratedWord, idx: number) => {
      if (!selectedWordIndexes[idx]) return;

      cardsToSave.push({
        word: item.word,
        ipa: item.ipa || null,
        definition: item.definition,
        definition_en: item.definition_en || null,
        example_sentence: item.example_sentence || null,
        example_translation: item.example_translation || null,
        part_of_speech: item.part_of_speech,
        card_type: item.card_type,
        cefr_level: item.cefr_level || null,
        tags: item.tags,
        source_type: 'ai_generated',
        collocations: item.collocations || null,
        word_family: item.word_family || null,
        mnemonic: item.mnemonic || null,
        force: true, // Lưu trực tiếp vì người dùng đã duyệt danh sách
      });
    });

    try {
      await bulkCreateMutation.mutateAsync(cardsToSave);
      if (onSavedSuccess) {
        onSavedSuccess();
      }
    } catch (err: unknown) {
      console.error('Lỗi lưu danh sách từ vựng:', err);
    }
  };

  const handleReset = () => {
    setGeneratedData(null);
    setSelectedWordIndexes({});
  };

  return {
    topicInput,
    setTopicInput,
    descriptionInput,
    setDescriptionInput,
    selectedCefrLevels,
    setSelectedCefrLevels,
    toggleCefrLevel,
    clearCefrLevels,
    wordCount,
    setWordCount,
    generatedData,
    selectedWordIndexes,
    isGenerating: generateMutation.isPending,
    isSaving: bulkCreateMutation.isPending,
    generateError: generateMutation.error,
    selectedCount,
    totalCount,
    isAllSelected,
    handleGenerate,
    toggleSelect,
    toggleSelectAll,
    handleSaveSelected,
    handleReset,
  };
}
