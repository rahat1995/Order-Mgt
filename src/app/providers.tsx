'use client';

import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { PageTransitionProvider } from '@/components/common/PageTransitionProvider';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded } = useSettings();

  useEffect(() => {
    if (isLoaded) {
      document.body.classList.remove('theme-slate', 'theme-stone');
      document.body.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme, isLoaded]);

  return <>{children}</>;
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeWrapper>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </ThemeWrapper>
    </SettingsProvider>
  );
}
