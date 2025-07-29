
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { MicrofinanceSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdmissionFeeForm() {
  const { settings, setMicrofinanceSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState<MicrofinanceSettings>(settings.microfinanceSettings);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.microfinanceSettings);
    }
  }, [settings.microfinanceSettings, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: parseFloat(value) || 0}));
  }

  const handleSave = () => {
    setMicrofinanceSettings(formData);
    alert('Admission fees saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Admission Fees</CardTitle>
        <CardDescription>
          Set fees charged to a member upon admission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="admissionFee">Admission Fee</Label>
            <Input id="admissionFee" type="number" value={formData.admissionFee || ''} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="passbookFee">Passbook Fee</Label>
            <Input id="passbookFee" type="number" value={formData.passbookFee || ''} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="kycFee">KYC Fee</Label>
            <Input id="kycFee" type="number" value={formData.kycFee || ''} onChange={handleInputChange} />
        </div>
        <Button onClick={handleSave}>Save Fees</Button>
      </CardContent>
    </Card>
  );
}
