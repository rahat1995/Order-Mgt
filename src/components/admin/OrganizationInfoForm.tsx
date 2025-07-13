
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { OrganizationInfo } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function OrganizationInfoForm() {
  const { settings, setOrganizationInfo, isLoaded } = useSettings();
  const [formData, setFormData] = useState<OrganizationInfo>(settings.organization);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.organization);
    }
  }, [settings.organization, isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    setOrganizationInfo(formData);
    alert('Organization information saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Info</CardTitle>
        <CardDescription>Update your company's details here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input id="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={formData.address} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input id="mobile" value={formData.mobile} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input id="contactPerson" value={formData.contactPerson} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input id="logo" placeholder="https://placehold.co/100x100.png" value={formData.logo} onChange={handleChange} />
            <p className="text-xs text-muted-foreground">Logo upload will be enabled in a future update. For now, please provide a URL.</p>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
            <Textarea id="receiptFooter" value={formData.receiptFooter || ''} onChange={handleChange} />
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
