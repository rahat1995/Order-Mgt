
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
  
  const { savingsProducts } = settings;

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.microfinanceSettings);
    }
  }, [settings.microfinanceSettings, isLoaded]);

  const handleSelectChange = (field: keyof MicrofinanceSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setMicrofinanceSettings(formData);
    alert('Microfinance settings saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }
  
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Terminology</CardTitle>
                <CardDescription>Customize the terms used within the microfinance module to match your organization's vocabulary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="samityTerm">Term for Member Groups</Label>
                    <Select onValueChange={(value) => handleSelectChange('samityTerm', value)} value={formData.samityTerm}>
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
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Primary Savings Product</CardTitle>
                <CardDescription>
                    Select a savings product to be automatically created for every new member upon registration.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <Label htmlFor="primarySavingsProduct">Primary Savings Product</Label>
                    <Select 
                        onValueChange={(value) => handleSelectChange('primarySavingsProductId', value)} 
                        value={formData.primarySavingsProductId || ''}
                        disabled={savingsProducts.length === 0}
                    >
                        <SelectTrigger id="primarySavingsProduct">
                            <SelectValue placeholder={savingsProducts.length > 0 ? "Select a product..." : "No savings products available"} />
                        </SelectTrigger>
                        <SelectContent>
                            {savingsProducts.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {savingsProducts.length === 0 && <p className="text-xs text-destructive">Please create a Savings Product first.</p>}
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button onClick={handleSave}>Save All Settings</Button>
        </div>
    </div>
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
