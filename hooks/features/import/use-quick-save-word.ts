'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importService } from '@/services/import.service';
import { cardKeys } from '@/constants/query-keys';
import type { QuickSaveWordDto } from '@/types/imported-text.types';

export function useQuickSaveWord() {
  const queryClient = useQueryClient();
  const [recentlySavedWords, setRecentlySavedWords] = useState<Set<string>>(new Set());

  const mutation = useMutation({
    mutationFn: (payload: QuickSaveWordDto) => importService.quickSaveWord(payload),
    onSuccess: (data, variables) => {
      const cleanWord = variables.word.toLowerCase().trim();
      setRecentlySavedWords((prev) => new Set(prev).add(cleanWord));
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });

  const isWordRecentlySaved = useCallback(
    (word: string) => {
      return recentlySavedWords.has(word.toLowerCase().trim());
    },
    [recentlySavedWords]
  );

  return {
    quickSave: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    isWordRecentlySaved,
    recentlySavedWords,
  };
}
