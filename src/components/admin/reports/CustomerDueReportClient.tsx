
'use client';

import React, { useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Customer, Order, Collection } from '@/types';

type CustomerWithDue = Customer & {
  dueAmount: number;
};

export function CustomerDueReportClient() {
  const { settings, isLoaded } = useSettings();
  const { customers, orders, collections } = settings;
  const router = useRouter();

  const customersWithDues = useMemo((): CustomerWithDue[] => {
    if (!isLoaded) return [];
    
    const customerDataMap = new Map<string, { totalBilled: number; totalPaid: number }>();

    orders.forEach(order => {
        if (!order.customerId) return;
        if (!customerDataMap.has(order.customerId)) {
          customerDataMap.set(order.customerId, { totalBilled: 0, totalPaid: 0 });
        }
        const data = customerDataMap.get(order.customerId)!;
        data.totalBilled += order.total;
        data.totalPaid += (order.amountTendered || 0);
    });

    collections.forEach(collection => {
      if (!collection.customerId || !customerDataMap.has(collection.customerId)) return;
      const data = customerDataMap.get(collection.customerId)!;
      data.totalPaid += collection.amount;
    });

    return customers
      .map(customer => {
        const dueData = customerDataMap.get(customer.id);
        if (!dueData) return null;

        const dueAmount = dueData.totalBilled - dueData.totalPaid;

        if (dueAmount <= 0) return null;
        
        return {
          ...customer,
          dueAmount: dueAmount,
        };
      })
      .filter((c): c is CustomerWithDue => c !== null)
      .sort((a, b) => b.dueAmount - a.dueAmount);

  }, [customers, orders, collections, isLoaded]);

  const handleCollectDue = (customerId: string) => {
    router.push(`/admin/modules/dueSell?customerId=${customerId}`);
  };
  
  if (!isLoaded) {
    return <div>Loading report...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Due Customers</CardTitle>
        <CardDescription>
          A list of all customers with pending payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Center</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customersWithDues.length > 0 ? (
              customersWithDues.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.mobile}</TableCell>
                  <TableCell>{customer.center || 'N/A'}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    ৳{customer.dueAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleCollectDue(customer.id)}>
                      Collect Due
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No customers with outstanding dues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
