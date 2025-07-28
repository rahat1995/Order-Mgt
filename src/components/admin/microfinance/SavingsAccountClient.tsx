
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import type { SavingsAccount, SavingsProduct } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export function SavingsAccountClient() {
  const { settings, addSavingsAccount, isLoaded } = useSettings();
  const { savingsAccounts, customers, savingsProducts, savingsProductTypes } = settings;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SavingsProduct | null>(null);
  const [recoverableAmount, setRecoverableAmount] = useState<number | string>('');

  useEffect(() => {
    if (selectedProductId) {
      const product = savingsProducts.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
      if (product && product.savingsProductTypeId === 'regular-savings') {
        setRecoverableAmount(product.rs_recoverableAmount || '');
      } else {
        setRecoverableAmount('');
      }
    } else {
      setSelectedProduct(null);
      setRecoverableAmount('');
    }
  }, [selectedProductId, savingsProducts]);

  const handleOpenDialog = () => {
    setSelectedCustomerId('');
    setSelectedProductId('');
    setSelectedProduct(null);
    setRecoverableAmount('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId) {
      alert("Please select a member and a savings product.");
      return;
    }
    
    const finalRecoverableAmount = (typeof recoverableAmount === 'string' && recoverableAmount.trim() === '') ? undefined : Number(recoverableAmount);

    addSavingsAccount({
      memberId: selectedCustomerId,
      savingsProductId: selectedProductId,
      recoverableAmount: finalRecoverableAmount,
    });
    
    alert('New savings account opened successfully!');
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading savings accounts...</div>;
  }
  
  const regularSavingsTypeId = savingsProductTypes.find(t => t.code === 'RS')?.id;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Accounts</CardTitle>
            <Button onClick={handleOpenDialog} size="sm" disabled={customers.length === 0 || savingsProducts.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Open New Account
            </Button>
          </div>
          {(customers.length === 0 || savingsProducts.length === 0) && (
              <CardDescription className="text-destructive pt-2">
                  Please ensure at least one member and one savings product exist before opening an account.
              </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account No.</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Recoverable</TableHead>
                <TableHead>Opening Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savingsAccounts.length > 0 ? (
                savingsAccounts.map(account => {
                  const member = customers.find(c => c.id === account.memberId);
                  const product = savingsProducts.find(p => p.id === account.savingsProductId);
                  const isRegularSavings = product?.savingsProductTypeId === regularSavingsTypeId;
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.accountNumber}</TableCell>
                      <TableCell className="font-medium">{member?.name || 'N/A'}</TableCell>
                      <TableCell>{product?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {isRegularSavings && account.recoverableAmount ? `৳${account.recoverableAmount.toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>{new Date(account.openingDate).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{account.status}</TableCell>
                      <TableCell className="text-right font-semibold">৳{account.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No savings accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open New Savings Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Member</Label>
                <Select name="customerId" value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
                  <SelectTrigger><SelectValue placeholder="Select a member..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name} ({customer.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productId">Savings Product</Label>
                <Select name="productId" value={selectedProductId} onValueChange={setSelectedProductId} required>
                  <SelectTrigger><SelectValue placeholder="Select a product..." /></SelectTrigger>
                  <SelectContent>
                    {savingsProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedProduct && selectedProduct.savingsProductTypeId === regularSavingsTypeId && (
                <div className="space-y-2">
                  <Label htmlFor="recoverableAmount">Recoverable Amount</Label>
                  <Input 
                    id="recoverableAmount"
                    name="recoverableAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter recoverable amount"
                    value={recoverableAmount}
                    onChange={(e) => setRecoverableAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">This is the fixed installment amount to be collected for this account.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">Open Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
