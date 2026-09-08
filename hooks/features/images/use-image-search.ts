import { useQuery } from '@tanstack/react-query';
import { imageKeys } from '@/constants/query-keys';
import { imagesService } from '@/services/images.service';
import type { ImageSearchResponse } from '@/types/image.types';

interface UseImageSearchOptions {
  enabled?: boolean;
  perPage?: number;
}

export function useImageSearch(query: string, options: UseImageSearchOptions = {}) {
  const { enabled = true, perPage = 6 } = options;
  const trimmedQuery = query.trim();

  return useQuery<ImageSearchResponse>({
    queryKey: imageKeys.search(trimmedQuery),
    queryFn: () => imagesService.searchImages(trimmedQuery, perPage),
    enabled: enabled && trimmedQuery.length > 0,
    staleTime: 1000 * 60 * 30, // 30 phút
    gcTime: 1000 * 60 * 60, // 1 giờ
  });
}
