'use client';

import React from 'react';
import { QueryProvider } from './query-provider';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </QueryProvider>
  );
}
