'use client';

import { SettingsProvider } from '@/context/SettingsContext';
import { PageTransitionProvider } from '@/components/common/PageTransitionProvider';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PageTransitionProvider>{children}</PageTransitionProvider>
    </SettingsProvider>
  );
}
