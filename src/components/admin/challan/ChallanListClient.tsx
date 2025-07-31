
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Challan, Customer, OrganizationInfo } from '@/types';
import { FileText, PlusCircle, Printer, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChallanPrint } from './print/ChallanPrint';
import { ItemLabelPrint } from './print/ItemLabelPrint';

const ChallanStatusBadge = ({ status }: { status: Challan['status'] }) => {
  const colorClassMap: { [key in Challan['status']]?: string } = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    'partially-billed': 'bg-blue-100 text-blue-800 border-blue-200',
    'fully-billed': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
  };
  return <Badge variant="outline" className={cn('font-semibold', colorClassMap[status])}>{status.replace('-', ' ')}</Badge>;
};

type PrintChallanInfo = {
  challan: Challan;
  customer: Customer;
  organization: OrganizationInfo;
};

export function ChallanListClient() {
  const { settings, isLoaded } = useSettings();
  const { challans, customers, organization } = settings;
  const router = useRouter();

  const [challanToPrint, setChallanToPrint] = useState<PrintChallanInfo | null>(null);
  const [labelsToPrint, setLabelsToPrint] = useState<Challan['items'] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const labelPrintRef = useRef<HTMLDivElement>(null);
  
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
    if (challanToPrint && printRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(printRef, `Challan - ${challanToPrint.challan.challanNumber}`);
        setChallanToPrint(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [challanToPrint]);
  
  useEffect(() => {
    if (labelsToPrint && labelPrintRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(labelPrintRef, `Item Labels`);
        setLabelsToPrint(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [labelsToPrint]);

  const handleReprint = (challan: Challan) => {
      const customer = customers.find(c => c.id === challan.customerId);
      if (!customer) {
          alert('Customer not found for this challan!');
          return;
      }
      setChallanToPrint({ challan, customer, organization });
  }

  const handleReprintLabels = (challan: Challan) => {
      setLabelsToPrint(challan.items);
  }


  if (!isLoaded) {
    return <div>Loading challans...</div>;
  }
  
  const sortedChallans = [...challans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <div className="hidden">
        {challanToPrint && (
          <div ref={printRef}>
            <ChallanPrint challan={challanToPrint.challan} customer={challanToPrint.customer} organization={challanToPrint.organization} />
          </div>
        )}
        {labelsToPrint && (
            <div ref={labelPrintRef}>
                <ItemLabelPrint items={labelsToPrint} />
            </div>
        )}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>All Challans</CardTitle>
              <CardDescription>A log of all delivery challans.</CardDescription>
          </div>
          <Button onClick={() => router.push('/admin/modules/challanAndBilling/create')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Challan
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challan No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedChallans.length > 0 ? (
                sortedChallans.map(challan => {
                    const customer = customers.find(c => c.id === challan.customerId);
                    return (
                      <TableRow key={challan.id}>
                        <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                        <TableCell>{new Date(challan.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{customer?.name || 'N/A'}</TableCell>
                        <TableCell>{challan.items.length}</TableCell>
                        <TableCell><ChallanStatusBadge status={challan.status} /></TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleReprint(challan)}>
                                <Printer className="mr-2 h-4 w-4" /> Reprint
                            </Button>
                             <Button variant="outline" size="sm" onClick={() => handleReprintLabels(challan)}>
                                <Tag className="mr-2 h-4 w-4" /> Print Labels
                            </Button>
                            {challan.status !== 'fully-billed' && challan.status !== 'cancelled' && (
                              <Button size="sm" onClick={() => router.push(`/admin/modules/challanAndBilling/bill/${challan.id}`)}>
                                  <FileText className="mr-2 h-4 w-4" /> Create Bill
                              </Button>
                            )}
                           </div>
                        </TableCell>
                      </TableRow>
                    )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No challans found. Click "Create New Challan" to start.
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
