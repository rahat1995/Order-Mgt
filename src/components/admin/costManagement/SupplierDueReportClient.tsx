
'use client';

import React, { useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Supplier } from '@/types';

type SupplierWithDue = Supplier & {
  dueAmount: number;
};

export function SupplierDueReportClient() {
  const { settings, isLoaded } = useSettings();
  const { suppliers, supplierBills, supplierPayments } = settings;
  const router = useRouter();

  const suppliersWithDues = useMemo((): SupplierWithDue[] => {
    if (!isLoaded) return [];

    const supplierDataMap = new Map<string, { totalBilled: number; totalPaid: number }>();

    suppliers.forEach(s => {
      supplierDataMap.set(s.id, { totalBilled: 0, totalPaid: 0 });
    });

    supplierBills.forEach(bill => {
        if (!supplierDataMap.has(bill.supplierId)) return;
        const data = supplierDataMap.get(bill.supplierId)!;
        data.totalBilled += bill.totalAmount;
        data.totalPaid += bill.paidAmount || 0;
    });

    supplierPayments.forEach(payment => {
        if (!supplierDataMap.has(payment.supplierId)) return;
        const data = supplierDataMap.get(payment.supplierId)!;
        if (!payment.billId) { // Only add general payments, bill-specific payments are covered in bill.paidAmount
            data.totalPaid += payment.amount;
        }
    });

    return suppliers
      .map(supplier => {
        const dueData = supplierDataMap.get(supplier.id);
        if (!dueData) return null;

        const dueAmount = dueData.totalBilled - dueData.totalPaid;

        if (dueAmount <= 0.01) return null; // Use a small epsilon for float comparison
        
        return {
          ...supplier,
          dueAmount: dueAmount,
        };
      })
      .filter((s): s is SupplierWithDue => s !== null)
      .sort((a, b) => b.dueAmount - a.dueAmount);

  }, [suppliers, supplierBills, supplierPayments, isLoaded]);

  const handleMakePayment = (supplierId: string) => {
    router.push(`/admin/modules/costManagement/payments?supplierId=${supplierId}`);
  };
  
  if (!isLoaded) {
    return <div>Loading report...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Due to Suppliers</CardTitle>
        <CardDescription>
          A list of all suppliers with pending payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliersWithDues.length > 0 ? (
              suppliersWithDues.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.mobile}</TableCell>
                  <TableCell>{supplier.contactPerson || 'N/A'}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    ৳{supplier.dueAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleMakePayment(supplier.id)}>
                      Make Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No supplier dues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
