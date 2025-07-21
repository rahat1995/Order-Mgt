
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { MicrofinanceSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Cog } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function MicrofinanceConfigurationForm() {
  const { settings, setMicrofinanceSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState<MicrofinanceSettings>(settings.microfinanceSettings);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.microfinanceSettings);
    }
  }, [settings.microfinanceSettings, isLoaded]);

  const handleSelectChange = (value: 'Samity' | 'Group' | 'Center') => {
    setFormData(prev => ({ ...prev, samityTerm: value }));
  };

  const handleSave = () => {
    setMicrofinanceSettings(formData);
    alert('Microfinance settings saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Terminology</CardTitle>
        <CardDescription>Customize the terms used within the microfinance module to match your organization's vocabulary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="samityTerm">Term for Member Groups</Label>
            <Select onValueChange={handleSelectChange} value={formData.samityTerm}>
                <SelectTrigger id="samityTerm">
                    <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Samity">Samity</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                    <SelectItem value="Center">Center</SelectItem>
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This will change the label for member groups across the module.</p>
        </div>
      </CardContent>
       <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}


export default function MicrofinanceConfigurationPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Cog className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Microfinance Configuration</h1>
      </div>
      <MicrofinanceConfigurationForm />
    </div>
  );
}
