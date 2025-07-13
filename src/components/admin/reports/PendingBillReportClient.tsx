
'use client';

import React, { useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Customer, Challan, ServiceJob } from '@/types';

type PendingBillItem = {
  id: string;
  type: 'Challan' | 'Service Job';
  refNumber: string;
  date: string;
  customer?: Customer;
  sourceObject: Challan | ServiceJob;
};

export function PendingBillReportClient() {
  const { settings, isLoaded } = useSettings();
  const { customers, challans, serviceJobs } = settings;
  const router = useRouter();

  const pendingItems = useMemo((): PendingBillItem[] => {
    if (!isLoaded) return [];

    const pendingChallans: PendingBillItem[] = challans
      .filter(c => c.status === 'pending' || c.status === 'partially-billed')
      .map(c => ({
        id: c.id,
        type: 'Challan',
        refNumber: c.challanNumber,
        date: c.createdAt,
        customer: customers.find(cust => cust.id === c.customerId),
        sourceObject: c,
      }));

    const pendingServiceJobs: PendingBillItem[] = serviceJobs
      .filter(j => !j.orderId)
      .map(j => ({
        id: j.id,
        type: 'Service Job',
        refNumber: j.jobNumber,
        date: j.createdAt,
        customer: customers.find(cust => cust.id === j.customerId),
        sourceObject: j,
      }));

    return [...pendingChallans, ...pendingServiceJobs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [customers, challans, serviceJobs, isLoaded]);

  const handleCreateBill = (item: PendingBillItem) => {
    if (item.type === 'Challan') {
      router.push(`/admin/modules/challanAndBilling/bill/${item.id}`);
    } else if (item.type === 'Service Job') {
      router.push(`/admin/modules/serviceJob/billing?jobId=${item.id}`);
    }
  };
  
  if (!isLoaded) {
    return <div>Loading report...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Pending Bills</CardTitle>
        <CardDescription>
          A combined list of all work that requires billing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reference No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingItems.length > 0 ? (
              pendingItems.map(item => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'Challan' ? 'secondary' : 'outline'}>{item.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.refNumber}</TableCell>
                  <TableCell>{item.customer?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleCreateBill(item)}>
                      Create Bill
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No pending bills found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
