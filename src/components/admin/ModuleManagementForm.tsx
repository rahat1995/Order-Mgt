
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { ModuleSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Receipt, Wrench, FileText, Boxes, LayoutGrid, DollarSign, BookUser, Users, ShieldCheck, LineChart, UserX, Package, FileClock, ClipboardList } from 'lucide-react';

const modulesData = [
  { key: 'pos', label: 'POS', icon: ShoppingCart, description: 'Menu, order entry, and voucher management.' },
  { key: 'customerManagement', label: 'Customer Management', icon: Users, description: 'Manage loyal customers and groups.' },
  { key: 'customerLedger', label: 'Customer Ledger', icon: ClipboardList, description: 'View detailed transaction history for customers.' },
  { key: 'salesReport', label: 'Sales Report', icon: LineChart, description: 'Analyze sales data and performance.' },
  { key: 'dueReport', label: 'Due Report', icon: UserX, description: 'View customers with outstanding dues.' },
  { key: 'pendingBillReport', label: 'Pending Bills', icon: FileClock, description: 'View unbilled challans and service jobs.' },
  { key: 'dueSell', label: 'Due Collection', icon: Receipt, description: 'Track and manage outstanding customer payments.' },
  { key: 'serviceJob', label: 'Service Job', icon: Wrench, description: 'Manage service and repair tasks.' },
  { key: 'challanAndBilling', label: 'Challan & Billing', icon: FileText, description: 'Handle delivery challans and invoicing.' },
  { key: 'productManagement', label: 'Product Management', icon: Package, description: 'Manage products for challans and billing.' },
  { key: 'inventory', label: 'Inventory', icon: Boxes, description: 'Stock and inventory level management.' },
  { key: 'tableManagement', label: 'Table Management', icon: LayoutGrid, description: 'Manage restaurant tables and seating.' },
  { key: 'costManagement', label: 'Cost Management', icon: DollarSign, description: 'Track bills, suppliers, and expenses.' },
  { key: 'accounting', label: 'Accounting', icon: BookUser, description: 'Manage financial accounts and ledgers.' },
  { key: 'hrManagement', label: 'HR Management', icon: Users, description: 'Manage employees, payroll, and attendance.' },
  { key: 'userAccessControl', label: 'User Access Control', icon: ShieldCheck, description: 'Define roles and permissions for users.' },
] as const;


export function ModuleManagementForm() {
  const { settings, setModuleSettings, isLoaded } = useSettings();
  const [formData, setFormData] = useState<ModuleSettings>(settings.modules);

  useEffect(() => {
    if (isLoaded) {
      setFormData(settings.modules);
    }
  }, [settings.modules, isLoaded]);

  const handleSwitchChange = (id: keyof ModuleSettings, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleSave = () => {
    setModuleSettings(formData);
    alert('Module settings saved!');
  };

  if (!isLoaded) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Management</CardTitle>
        <CardDescription>Activate or deactivate modules for your workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modulesData.map((module) => (
            <Card key={module.key} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <module.icon className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-lg font-semibold">{module.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between pb-4">
                 <Label htmlFor={module.key} className="text-sm font-medium">
                  {formData[module.key] ? 'Active' : 'Inactive'}
                </Label>
                <Switch
                  id={module.key}
                  checked={formData[module.key]}
                  onCheckedChange={(checked) => handleSwitchChange(module.key, checked)}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
