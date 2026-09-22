'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hook an toàn cho SSR / Next.js để kiểm tra component đã mount trên client hay chưa.
 * Sử dụng useSyncExternalStore chuẩn React 18+ để tránh hydration mismatch.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
