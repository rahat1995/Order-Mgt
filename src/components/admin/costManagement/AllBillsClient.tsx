
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SupplierBill, Supplier, OrganizationInfo } from '@/types';
import { FileText, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseBillPrint } from './print/PurchaseBillPrint';

const BillStatusBadge = ({ status }: { status: SupplierBill['paymentStatus'] }) => {
  const colorClassMap: { [key in SupplierBill['paymentStatus']]?: string } = {
    'unpaid': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    'partially-paid': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'paid': 'bg-green-100 text-green-800 border-green-200',
  };
  return <Badge variant="outline" className={cn('font-semibold', colorClassMap[status])}>{status.replace('-', ' ')}</Badge>;
};

type PrintBillInfo = {
  bill: SupplierBill;
  supplier: Supplier;
  organization: OrganizationInfo;
};

export function AllBillsClient() {
  const { settings, isLoaded } = useSettings();
  const { supplierBills, suppliers, organization } = settings;

  const [billToPrint, setBillToPrint] = useState<PrintBillInfo | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Could not open print window. Please disable your popup blocker.');
      return;
    }
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('\n');
    printWindow.document.write(`<html><head><title>${title}</title>${styleTags}</head><body>${contentRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };
  
  useEffect(() => {
    if (billToPrint && printRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(printRef, `Purchase Bill - ${billToPrint.bill.billNumber || billToPrint.bill.id}`);
        setBillToPrint(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [billToPrint]);
  
  const handlePrint = (bill: SupplierBill) => {
      const supplier = suppliers.find(s => s.id === bill.supplierId);
      if (!supplier) {
          alert('Supplier not found for this bill!');
          return;
      }
      setBillToPrint({ bill, supplier, organization });
  }

  if (!isLoaded) {
    return <div>Loading bills...</div>;
  }
  
  const sortedBills = [...supplierBills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="hidden">
        {billToPrint && (
          <div ref={printRef}>
            <PurchaseBillPrint bill={billToPrint.bill} supplier={billToPrint.supplier} organization={billToPrint.organization} />
          </div>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Recorded Bills</CardTitle>
          <CardDescription>A log of all recorded supplier bills.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill No.</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBills.length > 0 ? (
                sortedBills.map(bill => {
                    const supplier = suppliers.find(c => c.id === bill.supplierId);
                    const paidAmount = bill.paidAmount || 0;
                    const dueAmount = bill.totalAmount - paidAmount;
                    return (
                      <TableRow key={bill.id}>
                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{bill.billNumber || 'N/A'}</TableCell>
                        <TableCell>{supplier?.name || 'N/A'}</TableCell>
                        <TableCell>৳{bill.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>৳{paidAmount.toFixed(2)}</TableCell>
                        <TableCell className={cn(dueAmount > 0 && 'text-destructive font-semibold')}>৳{dueAmount.toFixed(2)}</TableCell>
                        <TableCell><BillStatusBadge status={bill.paymentStatus} /></TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePrint(bill)}>
                                <Printer className="mr-2 h-4 w-4" /> View Bill
                            </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No bills recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
