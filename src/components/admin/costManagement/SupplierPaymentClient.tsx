
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SupplierBill } from '@/types';

interface PaymentFormProps {
  supplierId: string;
  dueAmount: number;
  unpaidBills: SupplierBill[];
}

function PaymentForm({ supplierId, dueAmount, unpaidBills }: PaymentFormProps) {
  const { addSupplierPayment } = useSettings();
  const router = useRouter();
  
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    
    addSupplierPayment({
      supplierId: supplierId,
      amount: paymentAmount,
      date: paymentDate,
      notes: notes || undefined,
      billId: selectedBillId || undefined,
    });
    
    alert(`Payment of ৳${paymentAmount.toFixed(2)} recorded successfully.`);
    router.push('/admin/modules/costManagement/payments');
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-destructive">Current Due</p>
            <p className="text-2xl font-bold text-destructive">৳{dueAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billId">Apply to Specific Bill (Optional)</Label>
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
    </form>
  );
}


export function SupplierPaymentClient() {
  const { settings, isLoaded } = useSettings();
  const { suppliers, supplierBills, supplierPayments } = settings;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  
  useEffect(() => {
    const supplierIdFromUrl = searchParams.get('supplierId');
    if (supplierIdFromUrl) {
      setSelectedSupplierId(supplierIdFromUrl);
    }
  }, [searchParams]);

  const { dueAmount, unpaidBills } = useMemo(() => {
    if (!selectedSupplierId) return { dueAmount: 0, unpaidBills: [] };
    
    const billsForSupplier = supplierBills.filter(bill => bill.supplierId === selectedSupplierId);
    
    const totalBilled = billsForSupplier.reduce((sum, bill) => sum + bill.totalAmount, 0);

    const totalPaidForSupplier = supplierPayments
      .filter(payment => payment.supplierId === selectedSupplierId)
      .reduce((sum, payment) => sum + payment.amount, 0);
      
    return {
      dueAmount: totalBilled - totalPaidForSupplier,
      unpaidBills: billsForSupplier.filter(bill => bill.paymentStatus !== 'paid'),
    };
  }, [selectedSupplierId, supplierBills, supplierPayments]);

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    router.replace(`/admin/modules/costManagement/payments?supplierId=${supplierId}`, { scroll: false });
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>Record Supplier Payment</CardTitle>
          <CardDescription>Log a payment made to a supplier against their due balance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier</Label>
              <Select name="supplierId" value={selectedSupplierId} onValueChange={handleSupplierChange} required>
                <SelectTrigger><SelectValue placeholder="Select a supplier..." /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
        </CardContent>
        {selectedSupplierId && (
            <PaymentForm 
              supplierId={selectedSupplierId} 
              dueAmount={dueAmount} 
              unpaidBills={unpaidBills} 
            />
        )}
      </Card>
  );
}
