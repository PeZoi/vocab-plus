'use client';

import { useQuery } from '@tanstack/react-query';
import { importService } from '@/services/import.service';
import { importKeys } from '@/constants/query-keys';
import type { ImportedText } from '@/types/imported-text.types';

export function useImportedTextsQuery() {
  return useQuery<ImportedText[], Error>({
    queryKey: importKeys.lists(),
    queryFn: importService.getImportedTexts,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
}

export function useImportedTextDetailQuery(id: string | null) {
  return useQuery<ImportedText, Error>({
    queryKey: id ? importKeys.detail(id) : ['imported-texts', 'none'],
    queryFn: () => (id ? importService.getImportedTextById(id) : Promise.reject(new Error('No ID'))),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
