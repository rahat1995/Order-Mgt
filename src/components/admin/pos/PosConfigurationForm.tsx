
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { PosSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PosConfigurationForm() {
  const { settings, setPosSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState<PosSettings>(settings.posSettings);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.posSettings);
    }
  }, [settings.posSettings, isLoaded]);

  const handleSwitchChange = (id: keyof PosSettings, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value === '' ? 0 : parseFloat(value) }));
  }

  const handleSave = () => {
    setPosSettings(formData);
    alert('POS settings saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>POS Behavior Settings</CardTitle>
        <CardDescription>Control how the POS screen functions for cashiers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="advancedItemOptions" className="text-base">Advanced Item Options</Label>
                    <p className="text-sm text-muted-foreground">Show variant/add-on dialog when clicking an item.</p>
                </div>
                <Switch
                    id="advancedItemOptions"
                    checked={formData.advancedItemOptions}
                    onCheckedChange={(checked) => handleSwitchChange('advancedItemOptions', checked)}
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="showItemsByCategory" className="text-base">Category-wise Item Display</Label>
                    <p className="text-sm text-muted-foreground">Group items into tabs by category.</p>
                </div>
                <Switch
                    id="showItemsByCategory"
                    checked={formData.showItemsByCategory}
                    onCheckedChange={(checked) => handleSwitchChange('showItemsByCategory', checked)}
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="showPrintWithKitchenButton" className="text-base">Show Kitchen Print Button</Label>
                    <p className="text-sm text-muted-foreground">Display the "Print with Kitchen copy" button.</p>
                </div>
                <Switch
                    id="showPrintWithKitchenButton"
                    checked={formData.showPrintWithKitchenButton}
                    onCheckedChange={(checked) => handleSwitchChange('showPrintWithKitchenButton', checked)}
                />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="enableOrderTypes" className="text-base">Show Order Types</Label>
                    <p className="text-sm text-muted-foreground">Display Dine-In, Takeaway, and Delivery options.</p>
                </div>
                <Switch
                    id="enableOrderTypes"
                    checked={formData.enableOrderTypes}
                    onCheckedChange={(checked) => handleSwitchChange('enableOrderTypes', checked)}
                />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="allowQuantityEdit" className="text-base">Allow Quantity Edit</Label>
                    <p className="text-sm text-muted-foreground">Allow direct editing of quantity in the cart.</p>
                </div>
                <Switch
                    id="allowQuantityEdit"
                    checked={formData.allowQuantityEdit}
                    onCheckedChange={(checked) => handleSwitchChange('allowQuantityEdit', checked)}
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="allowPriceEdit" className="text-base">Allow Price Edit</Label>
                    <p className="text-sm text-muted-foreground">Allow editing item unit prices in the cart.</p>
                </div>
                <Switch
                    id="allowPriceEdit"
                    checked={formData.allowPriceEdit}
                    onCheckedChange={(checked) => handleSwitchChange('allowPriceEdit', checked)}
                />
            </div>
        </div>

        <div className="border-t pt-6">
            <h3 className="text-lg font-medium">Discount Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">Set global limits for manual discounts. Enter 0 for no limit.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (৳)</Label>
                    <Input id="maxDiscountAmount" type="number" step="0.01" value={formData.maxDiscountAmount} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxDiscountPercentage">Maximum Discount Percentage (%)</Label>
                    <Input id="maxDiscountPercentage" type="number" step="0.01" value={formData.maxDiscountPercentage} onChange={handleInputChange} />
                </div>
             </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
