
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { SavingsProduct, SavingsInterestFrequency, SavingsInterestCalculationMethod } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const interestFrequencies: SavingsInterestFrequency[] = ['daily', 'weekly', 'monthly', 'half-yearly', 'yearly'];
const interestCalcMethods: SavingsInterestCalculationMethod[] = ['opening-closing-average', 'closing-balance'];

export function SavingsProductClient() {
  const { settings, addSavingsProduct, updateSavingsProduct, deleteSavingsProduct, isLoaded } = useSettings();
  const { savingsProducts, savingsProductTypes } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SavingsProduct | null>(null);

  const handleOpenDialog = (product: SavingsProduct | null) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Omit<SavingsProduct, 'id'> = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      savingsProductTypeId: formData.get('savingsProductTypeId') as string,
      interestRate: parseFloat(formData.get('interestRate') as string),
      interestProvisionFrequency: formData.get('interestProvisionFrequency') as SavingsInterestFrequency,
      interestDisbursementFrequency: formData.get('interestDisbursementFrequency') as SavingsInterestFrequency,
      interestCalculationMethod: formData.get('interestCalculationMethod') as SavingsInterestCalculationMethod,
    };

    if (!productData.name || !productData.code || !productData.savingsProductTypeId || isNaN(productData.interestRate)) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingProduct) {
      updateSavingsProduct({ ...editingProduct, ...productData });
    } else {
      addSavingsProduct(productData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading savings products...</div>;
  }
  
  const getTypeName = (typeId: string) => {
    return savingsProductTypes.find(t => t.id === typeId)?.name || 'N/A';
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)} disabled={savingsProductTypes.length === 0}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Savings Product
        </Button>
      </div>
      {savingsProductTypes.length === 0 && (
          <p className="text-destructive text-sm text-right mt-2">Please define Savings Product Types first.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {savingsProducts.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{getTypeName(product.savingsProductTypeId)} ({product.code})</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{product.interestRate}% Interest Rate</p>
              <p className="text-sm text-muted-foreground">Provision: {product.interestProvisionFrequency}</p>
              <p className="text-sm text-muted-foreground">Disbursement: {product.interestDisbursementFrequency}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSavingsProduct(product.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       {savingsProducts.length === 0 && (
            <Card className="col-span-full text-center py-12 mt-4">
                <CardHeader>
                    <CardTitle>No Savings Products Found</CardTitle>
                    <CardDescription>Click "Add New Savings Product" to get started.</CardDescription>
                </CardHeader>
            </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Savings Product' : 'Add New Savings Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                <Label htmlFor="savingsProductTypeId">Savings Type</Label>
                <Select name="savingsProductTypeId" defaultValue={editingProduct?.savingsProductTypeId} required>
                  <SelectTrigger><SelectValue placeholder="Select a base type..."/></SelectTrigger>
                  <SelectContent>
                    {savingsProductTypes.map(type => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Product Code</Label>
                    <Input id="code" name="code" defaultValue={editingProduct?.code} required />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input id="interestRate" name="interestRate" type="number" step="0.01" defaultValue={editingProduct?.interestRate} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestProvisionFrequency">Interest Provision Frequency</Label>
                <Select name="interestProvisionFrequency" defaultValue={editingProduct?.interestProvisionFrequency || 'monthly'} required>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {interestFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="interestDisbursementFrequency">Interest Disbursement Frequency</Label>
                <Select name="interestDisbursementFrequency" defaultValue={editingProduct?.interestDisbursementFrequency || 'monthly'} required>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {interestFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="interestCalculationMethod">Interest Calculation Method</Label>
                <Select name="interestCalculationMethod" defaultValue={editingProduct?.interestCalculationMethod || 'closing-balance'} required>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="closing-balance">Month Closing Balance</SelectItem>
                    <SelectItem value="opening-closing-average">Month Opening-Closing Average</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
