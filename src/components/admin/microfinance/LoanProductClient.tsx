
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { LoanProduct, InterestCalculationMethod, RepaymentFrequency } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LoanProductClient() {
  const { settings, addLoanProduct, updateLoanProduct, deleteLoanProduct, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);

  const handleOpenDialog = (product: LoanProduct | null) => {
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
    
    const productData: Omit<LoanProduct, 'id'> = {
      name: formData.get('name') as string,
      shortName: formData.get('shortName') as string,
      code: formData.get('code') as string,
      minAmount: parseFloat(formData.get('minAmount') as string),
      maxAmount: parseFloat(formData.get('maxAmount') as string),
      defaultAmount: parseFloat(formData.get('defaultAmount') as string),
      insuranceType: formData.get('insuranceType') as 'percentage' | 'fixed',
      insuranceValue: parseFloat(formData.get('insuranceValue') as string),
      processingFee: parseFloat(formData.get('processingFee') as string),
      formFee: parseFloat(formData.get('formFee') as string),
      applicationFee: parseFloat(formData.get('applicationFee') as string),
      additionalFee: parseFloat(formData.get('additionalFee') as string),
      otherFee: parseFloat(formData.get('otherFee') as string),
      repaymentFrequency: formData.get('repaymentFrequency') as RepaymentFrequency,
      numberOfInstallments: parseInt(formData.get('numberOfInstallments') as string, 10),
      interestRate: parseFloat(formData.get('interestRate') as string),
      interestCalculationMethod: formData.get('interestCalculationMethod') as InterestCalculationMethod,
    };
    
    // Basic validation
    if (!productData.name || !productData.code || isNaN(productData.interestRate)) {
      alert("Please fill all required fields: Name, Code, and Interest Rate.");
      return;
    }

    if (editingProduct) {
      updateLoanProduct({ ...editingProduct, ...productData });
    } else {
      addLoanProduct(productData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading loan products...</div>;
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Loan Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.loanProducts.length > 0 ? settings.loanProducts.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.shortName} ({product.code})</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">Interest: {product.interestRate}% ({product.interestCalculationMethod})</p>
              <p className="text-sm text-muted-foreground">Repayment: {product.numberOfInstallments} {product.repaymentFrequency} installments</p>
              <p className="text-sm text-muted-foreground">Amount: ৳{product.minAmount} - ৳{product.maxAmount}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLoanProduct(product.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        )) : (
            <Card className="col-span-full text-center py-12">
                <CardHeader>
                    <CardTitle>No Loan Products Found</CardTitle>
                    <CardDescription>Click "Add New Loan Product" to get started.</CardDescription>
                </CardHeader>
            </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Loan Product' : 'Add New Loan Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[70vh] p-4">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label htmlFor="name">Product Name</Label><Input id="name" name="name" defaultValue={editingProduct?.name} required /></div>
                        <div className="space-y-2"><Label htmlFor="shortName">Short Name</Label><Input id="shortName" name="shortName" defaultValue={editingProduct?.shortName} /></div>
                        <div className="space-y-2"><Label htmlFor="code">Code</Label><Input id="code" name="code" defaultValue={editingProduct?.code} required /></div>
                    </div>
                </div>

                {/* Loan Amount */}
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Loan Amount</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label htmlFor="minAmount">Min Amount</Label><Input id="minAmount" name="minAmount" type="number" defaultValue={editingProduct?.minAmount} /></div>
                        <div className="space-y-2"><Label htmlFor="maxAmount">Max Amount</Label><Input id="maxAmount" name="maxAmount" type="number" defaultValue={editingProduct?.maxAmount} /></div>
                        <div className="space-y-2"><Label htmlFor="defaultAmount">Default/Avg Amount</Label><Input id="defaultAmount" name="defaultAmount" type="number" defaultValue={editingProduct?.defaultAmount} /></div>
                    </div>
                </div>

                {/* Fees and Insurance */}
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Fees & Insurance</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2"><Label>Insurance</Label><div className="flex gap-2"><Select name="insuranceType" defaultValue={editingProduct?.insuranceType || 'percentage'}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent></Select><Input name="insuranceValue" type="number" step="0.01" defaultValue={editingProduct?.insuranceValue} /></div></div>
                         <div className="space-y-2"><Label htmlFor="processingFee">Processing Fee</Label><Input id="processingFee" name="processingFee" type="number" step="0.01" defaultValue={editingProduct?.processingFee} /></div>
                         <div className="space-y-2"><Label htmlFor="formFee">Form Fee</Label><Input id="formFee" name="formFee" type="number" step="0.01" defaultValue={editingProduct?.formFee} /></div>
                         <div className="space-y-2"><Label htmlFor="applicationFee">Application Fee</Label><Input id="applicationFee" name="applicationFee" type="number" step="0.01" defaultValue={editingProduct?.applicationFee} /></div>
                         <div className="space-y-2"><Label htmlFor="additionalFee">Additional Fee</Label><Input id="additionalFee" name="additionalFee" type="number" step="0.01" defaultValue={editingProduct?.additionalFee} /></div>
                         <div className="space-y-2"><Label htmlFor="otherFee">Other Fee</Label><Input id="otherFee" name="otherFee" type="number" step="0.01" defaultValue={editingProduct?.otherFee} /></div>
                     </div>
                </div>

                {/* Repayment and Interest */}
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Repayment & Interest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="repaymentFrequency">Repayment Frequency</Label><Select name="repaymentFrequency" defaultValue={editingProduct?.repaymentFrequency}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="one-time">One Time</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="numberOfInstallments">Number of Installments</Label><Input id="numberOfInstallments" name="numberOfInstallments" type="number" defaultValue={editingProduct?.numberOfInstallments} /></div>
                        <div className="space-y-2"><Label htmlFor="interestRate">Interest Rate (%)</Label><Input id="interestRate" name="interestRate" type="number" step="0.01" defaultValue={editingProduct?.interestRate} required /></div>
                        <div className="space-y-2"><Label htmlFor="interestCalculationMethod">Interest Calculation</Label><Select name="interestCalculationMethod" defaultValue={editingProduct?.interestCalculationMethod}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="flat">Flat</SelectItem><SelectItem value="reducing-balance">Reducing Balance</SelectItem></SelectContent></Select></div>
                    </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
