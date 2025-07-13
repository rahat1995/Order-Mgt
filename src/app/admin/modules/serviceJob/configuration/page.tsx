
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { ServiceJobSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';


function ServiceJobConfigurationForm() {
  const { settings, setServiceJobSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState<ServiceJobSettings>(settings.serviceJobSettings);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.serviceJobSettings);
    }
  }, [settings.serviceJobSettings, isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    setServiceJobSettings(formData);
    alert('Service Job settings saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Job Settings</CardTitle>
        <CardDescription>Customize default settings for the service job module.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="termsAndConditions">Job Card Terms & Conditions</Label>
            <Textarea id="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} rows={10} />
            <p className="text-xs text-muted-foreground">This text will appear at the bottom of every printable job card.</p>
        </div>
      </CardContent>
       <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}


export default function ServiceJobConfigurationPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Service Job Configuration</h1>
      </div>
      <ServiceJobConfigurationForm />
    </div>
  );
}
