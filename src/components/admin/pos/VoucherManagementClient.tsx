

'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Voucher } from '@/types';

export function VoucherManagementClient() {
  const { settings, addVoucher, updateVoucher, deleteVoucher, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const handleOpenDialog = (voucher: Voucher | null) => {
    setEditingVoucher(voucher);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingVoucher(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const voucherData = {
      code: formData.get('code') as string,
      type: formData.get('type') as 'fixed' | 'percentage',
      value: parseFloat(formData.get('value') as string),
      isActive: (formData.get('isActive') as string) === 'on',
      minOrderValue: parseFloat(formData.get('minOrderValue') as string) || undefined,
      maxDiscountAmount: parseFloat(formData.get('maxDiscountAmount') as string) || undefined,
      startDate: formData.get('startDate') as string || undefined,
      endDate: formData.get('endDate') as string || undefined,
    };

    if (!voucherData.code || !voucherData.type || isNaN(voucherData.value)) return;

    if (editingVoucher) {
      updateVoucher({ ...editingVoucher, ...voucherData });
    } else {
      addVoucher(voucherData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading vouchers...</div>;
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.vouchers.map(voucher => (
          <Card key={voucher.id}>
            <CardHeader>
              <CardTitle>{voucher.code}</CardTitle>
              <CardDescription>
                Discount: {voucher.type === 'fixed' ? `৳${voucher.value.toFixed(2)}` : `${voucher.value}%`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-sm font-semibold ${voucher.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {voucher.isActive ? 'Active' : 'Inactive'}
              </p>
               {voucher.minOrderValue && <p className="text-xs text-muted-foreground">Min order: ৳{voucher.minOrderValue}</p>}
               {voucher.maxDiscountAmount && voucher.type === 'percentage' && <p className="text-xs text-muted-foreground">Max discount: ৳{voucher.maxDiscountAmount}</p>}
               {voucher.startDate && voucher.endDate && <p className="text-xs text-muted-foreground">Valid: {new Date(voucher.startDate).toLocaleDateString()} - {new Date(voucher.endDate).toLocaleDateString()}</p>}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(voucher)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteVoucher(voucher.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {settings.vouchers.length === 0 && (
          <Card className="text-center py-12 col-span-full">
            <CardHeader>
              <CardTitle>No Vouchers Found</CardTitle>
              <CardDescription>Click "Create New Voucher" to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Voucher Code</Label>
                <Input id="code" name="code" defaultValue={editingVoucher?.code} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select name="type" defaultValue={editingVoucher?.type || 'fixed'} required>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" name="value" type="number" step="0.01" defaultValue={editingVoucher?.value} required />
                </div>
              </div>
              <div className="border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="minOrderValue">Minimum Order Value (Optional)</Label>
                    <Input id="minOrderValue" name="minOrderValue" type="number" step="0.01" defaultValue={editingVoucher?.minOrderValue} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Max Discount Amount (for %)</Label>
                    <Input id="maxDiscountAmount" name="maxDiscountAmount" type="number" step="0.01" defaultValue={editingVoucher?.maxDiscountAmount} />
                </div>
              </div>
               <div className="border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input id="startDate" name="startDate" type="date" defaultValue={editingVoucher?.startDate} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input id="endDate" name="endDate" type="date" defaultValue={editingVoucher?.endDate} />
                </div>
              </div>
               <div className="flex items-center space-x-2 pt-4 mt-2 border-t">
                <Switch id="isActive" name="isActive" defaultChecked={editingVoucher?.isActive ?? true} />
                <Label htmlFor="isActive">Voucher is Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingVoucher ? 'Save Changes' : 'Create Voucher'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
