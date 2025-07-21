
'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FixedAsset } from '@/types';

export function AssetRegistrationClient() {
  const { settings, addFixedAsset } = useSettings();
  const { assetLocations, employees } = settings;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const locationId = formData.get('locationId') as string;
    const employeeId = formData.get('employeeId') as string;
    
    const assetData: Omit<FixedAsset, 'id'> = {
      name: formData.get('name') as string,
      purchaseDate: formData.get('purchaseDate') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      depreciationMethod: formData.get('depreciationMethod') as 'Straight-Line' | 'Reducing Balance',
      usefulLife: parseFloat(formData.get('usefulLife') as string),
      salvageValue: parseFloat(formData.get('salvageValue') as string),
      locationId: locationId === 'none' ? undefined : locationId,
      employeeId: employeeId === 'none' ? undefined : employeeId,
    };

    if (
      !assetData.name ||
      !assetData.purchaseDate ||
      isNaN(assetData.purchasePrice) ||
      !assetData.depreciationMethod ||
      isNaN(assetData.usefulLife) ||
      isNaN(assetData.salvageValue)
    ) {
      alert('Please fill out all fields with valid values.');
      return;
    }
    
    addFixedAsset(assetData);
    alert('Fixed asset registered successfully!');
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Enter Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input id="name" name="name" required placeholder="e.g., Office Laptop" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" name="purchaseDate" type="date" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (Cost)</Label>
              <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                <Select name="depreciationMethod" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Straight-Line">Straight-Line Method</SelectItem>
                        <SelectItem value="Reducing Balance">Reducing Balance Method</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                <Input id="usefulLife" name="usefulLife" type="number" required placeholder="e.g., 5" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="salvageValue">Salvage Value</Label>
                <Input id="salvageValue" name="salvageValue" type="number" step="0.01" required placeholder="0.00" />
            </div>
          </div>
          <div className="border-t pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="locationId">Issue to Location (Branch/Office)</Label>
                    <Select name="locationId">
                        <SelectTrigger><SelectValue placeholder="Select a location"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {assetLocations.map(loc => (
                                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="employeeId">Issue to Staff</Label>
                    <Select name="employeeId">
                        <SelectTrigger><SelectValue placeholder="Select an employee"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Asset</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
