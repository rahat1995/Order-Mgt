
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { ChallanSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function ChallanConfigurationForm() {
  const { settings, setChallanSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState<ChallanSettings>(settings.challanSettings);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.challanSettings);
    }
  }, [settings.challanSettings, isLoaded]);

  const handleSwitchChange = (id: keyof ChallanSettings, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSave = () => {
    setChallanSettings(formData);
    alert('Challan settings saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Printing Settings</CardTitle>
        <CardDescription>Control how challans are printed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="printWithOfficeCopy" className="text-base">Print with Office Copy</Label>
                <p className="text-sm text-muted-foreground">When enabled, the printout will include both a customer and an office copy.</p>
            </div>
            <Switch
                id="printWithOfficeCopy"
                checked={formData.printWithOfficeCopy}
                onCheckedChange={(checked) => handleSwitchChange('printWithOfficeCopy', checked)}
            />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="printOfficeCopyWithPrice" className="text-base">Print Office Copy with Price</Label>
                <p className="text-sm text-muted-foreground">If Office Copy is enabled, this will show prices on it.</p>
            </div>
            <Switch
                id="printOfficeCopyWithPrice"
                checked={formData.printOfficeCopyWithPrice}
                onCheckedChange={(checked) => handleSwitchChange('printOfficeCopyWithPrice', checked)}
                disabled={!formData.printWithOfficeCopy}
            />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
