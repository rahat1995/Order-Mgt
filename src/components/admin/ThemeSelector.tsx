'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { name: 'slate', label: 'Slate' },
  { name: 'stone', label: 'Stone' },
] as const;

export function ThemeSelector() {
  const { settings, setTheme, isLoaded } = useSettings();
  
  if (!isLoaded) {
    return <div>Loading theme settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Select a color theme for your workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isActive = settings.theme === theme.name;
            return (
              <div key={theme.name}>
                <button
                  onClick={() => setTheme(theme.name)}
                  className={cn(
                    'block w-full rounded-lg border-2 p-1',
                    isActive ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                    <div className={cn('theme-' + theme.name)}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary" />
                        <div className="h-6 w-6 rounded-full bg-secondary" />
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">{theme.label}</span>
                    {isActive && <Check className="ml-auto h-5 w-5 text-primary" />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
