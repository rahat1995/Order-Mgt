
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SupplierPaymentClient() {
  const { settings, addSupplierPayment, isLoaded } = useSettings();
  const { suppliers, supplierBills } = settings;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');

  useEffect(() => {
    const supplierIdFromUrl = searchParams.get('supplierId');
    if (supplierIdFromUrl) {
      setSelectedSupplierId(supplierIdFromUrl);
    }
  }, [searchParams]);

  const unpaidBills = useMemo(() => {
    if (!selectedSupplierId) return [];
    return supplierBills.filter(bill => bill.supplierId === selectedSupplierId && bill.paymentStatus !== 'paid');
  }, [selectedSupplierId, supplierBills]);
  
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setSelectedBillId('');
    // Use Next.js router to update URL without a full page refresh
    const currentPath = window.location.pathname;
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set('supplierId', supplierId);
    router.push(`${currentPath}?${newSearchParams.toString()}`, { scroll: false });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (!selectedSupplierId || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Please select a supplier and enter a valid payment amount.');
      return;
    }
    
    addSupplierPayment({
      supplierId: selectedSupplierId,
      amount: paymentAmount,
      date: paymentDate,
      notes: notes || undefined,
      billId: selectedBillId || undefined,
    });
    
    alert(`Payment of ৳${paymentAmount.toFixed(2)} recorded successfully.`);
    
    // Reset form
    setSelectedSupplierId('');
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSelectedBillId('');
    router.push('/admin/modules/costManagement/payments', { scroll: false });
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Record Supplier Payment</CardTitle>
          <CardDescription>Log a payment made to a supplier against their due balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier</Label>
              <Select name="supplierId" value={selectedSupplierId} onValueChange={handleSupplierChange} required>
                <SelectTrigger><SelectValue placeholder="Select a supplier..." /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billId">Apply to Bill (Optional)</Label>
              <Select name="billId" value={selectedBillId} onValueChange={setSelectedBillId} disabled={unpaidBills.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={unpaidBills.length > 0 ? "Select an unpaid bill..." : "No unpaid bills for supplier"} />
                </SelectTrigger>
                <SelectContent>
                  {unpaidBills.map(bill => (
                    <SelectItem key={bill.id} value={bill.id}>
                      Bill #{bill.billNumber || bill.id.slice(0, 8)} - Due: ৳{(bill.totalAmount - (bill.paidAmount || 0)).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input id="paymentDate" name="paymentDate" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" name="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Bank transfer reference" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Record Payment</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
