
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function LogExpenseClient() {
  const { settings, addSupplierBill, isLoaded } = useSettings();
  const { suppliers, expenseCategories } = settings;

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId || !amount) {
        alert("Expense Category and Amount are required.");
        return;
    }

    addSupplierBill({
        categoryId: selectedCategoryId,
        amount: parseFloat(amount),
        date: expenseDate,
        supplierId: selectedSupplierId === 'none' ? undefined : selectedSupplierId,
        billNumber: billNumber || undefined,
        notes: notes || undefined,
    });
    
    alert('Expense/Bill logged successfully!');
    
    // Reset form
    setSelectedCategoryId('');
    setSelectedSupplierId('');
    setAmount('');
    setBillNumber('');
    setNotes('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Expense / Bill</CardTitle>
        <CardDescription>
          Select 'none' for supplier to log a general expense like a salary.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Expense Category</Label>
              <Select name="categoryId" value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                <SelectTrigger><SelectValue placeholder="Select a category..."/></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier</Label>
              <Select name="supplierId" value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select a supplier (optional)"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (General Expense)</SelectItem>
                  {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" name="expenseDate" type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billNumber">Bill / Invoice Number (Optional)</Label>
            <Input id="billNumber" name="billNumber" placeholder="e.g., INV-12345" value={billNumber} onChange={e => setBillNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" name="notes" placeholder="e.g., Purchase of raw materials" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Log Expense</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
