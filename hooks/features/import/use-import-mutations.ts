'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importService } from '@/services/import.service';
import { importKeys } from '@/constants/query-keys';
import type { CreateImportedTextDto } from '@/types/imported-text.types';

export function useSaveImportedTextMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateImportedTextDto) => importService.saveImportedText(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}

export function useDeleteImportedTextMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => importService.deleteImportedText(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}
