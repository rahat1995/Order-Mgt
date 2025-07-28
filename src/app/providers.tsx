
'use client';

import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import React, { useEffect } from 'react';

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
        {children}
      </ThemeWrapper>
    </SettingsProvider>
  );
}
