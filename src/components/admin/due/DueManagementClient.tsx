
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Printer, History, ScanLine } from 'lucide-react';
import type { Customer, Order, Collection, OrganizationInfo } from '@/types';
import { MoneyReceipt } from './print/MoneyReceipt';

type Transaction = {
  id: string;
  type: 'Initial Payment' | 'Due Collection';
  date: string;
  amount: number;
  orderNumber?: string;
  collection: Collection;
};

export function DueManagementClient() {
  const { settings, addCollection, isLoaded } = useSettings();
  const { customers, orders, collections, organization, serviceJobs } = settings;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [receiptToPrint, setReceiptToPrint] = useState<{ collection: Collection, customer: Customer, organization: OrganizationInfo } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const collectionAmountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const customerIdFromUrl = searchParams.get('customerId');
    if (customerIdFromUrl) {
      setSelectedCustomerId(customerIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (receiptToPrint && receiptRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(receiptRef, 'Money Receipt');
        setReceiptToPrint(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [receiptToPrint]);

  const { selectedCustomer, totalDue, transactionHistory } = useMemo(() => {
    if (!selectedCustomerId) {
      return { selectedCustomer: null, totalDue: 0, transactionHistory: [] };
    }
    const customer = customers.find(c => c.id === selectedCustomerId) || null;
    if (!customer) {
      return { selectedCustomer: null, totalDue: 0, transactionHistory: [] };
    }

    const customerOrders = orders.filter(o => o.customerId === customer.id);
    const customerCollections = collections.filter(c => c.customerId === customer.id);

    const totalBilled = customerOrders.reduce((acc, order) => acc + order.total, 0);
    
    const totalInitialPayments = customerOrders.reduce((acc, order) => acc + (order.amountTendered || 0), 0);
    const totalSubsequentCollections = customerCollections.reduce((acc, c) => acc + c.amount, 0);
    const totalPaid = totalInitialPayments + totalSubsequentCollections;

    const due = totalBilled - totalPaid;

    const initialPayments: Transaction[] = customerOrders
      .filter(o => (o.amountTendered || 0) > 0)
      .map(o => ({
        id: o.id,
        type: 'Initial Payment',
        date: o.createdAt,
        amount: o.amountTendered || 0,
        orderNumber: o.orderNumber,
        collection: {
          id: `initial-${o.id}`,
          customerId: o.customerId!,
          amount: o.amountTendered || 0,
          date: o.createdAt,
          notes: `Initial payment for Order #${o.orderNumber}`,
        }
      }));
      
    const subsequentCollections: Transaction[] = customerCollections
        .map(c => ({
            id: c.id,
            type: 'Due Collection',
            date: c.date,
            amount: c.amount,
            collection: c
        }));

    const history = [...initialPayments, ...subsequentCollections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { selectedCustomer: customer, totalDue: due, transactionHistory: history };
  }, [selectedCustomerId, customers, orders, collections]);

  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(collectionAmount);
    if (!selectedCustomerId || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    addCollection({
      customerId: selectedCustomerId,
      amount,
      notes,
    });
    alert(`Collected ৳${amount.toFixed(2)} from ${selectedCustomer?.name}.`);
    setCollectionAmount('');
    setNotes('');
  };

  const handlePrintReceipt = (collection: Collection) => {
    if (!selectedCustomer) return;
    setReceiptToPrint({ collection, customer: selectedCustomer, organization });
  };
  
  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Could not open print window. Please disable your popup blocker.');
      return;
    }
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('\n');
    printWindow.document.write(`<html><head><title>${title}</title>${styleTags}</head><body><div class="p-4">${contentRef.current.innerHTML}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };
  
  const handleBarcodeScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scannedCode = (formData.get('barcode') as string).trim();
    
    if (!scannedCode) return;

    // First, try to find by Order Number (for POS sales)
    let order = orders.find(o => o.orderNumber === scannedCode);
    
    // If not found, try to find by Service Job Number
    if (!order) {
        const job = serviceJobs.find(j => j.jobNumber === scannedCode);
        if (job && job.orderId) {
            order = orders.find(o => o.id === job.orderId);
        }
    }
    
    if (order && order.customerId) {
        setSelectedCustomerId(order.customerId);
        router.push(`/admin/modules/dueSell?customerId=${order.customerId}`, { shallow: true });
        setTimeout(() => {
          collectionAmountInputRef.current?.focus();
        }, 100);
    } else {
        alert('Order not found or has no associated customer.');
    }
    e.currentTarget.reset();
  }


  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="hidden">
        {receiptToPrint && <div ref={receiptRef}><MoneyReceipt {...receiptToPrint} /></div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer Selection */}
        <Card>
            <CardHeader>
            <CardTitle>Select Customer</CardTitle>
            <CardDescription>Search for a customer by name or mobile number.</CardDescription>
            </CardHeader>
            <CardContent>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                >
                    {selectedCustomerId
                    ? customers.find(c => c.id === selectedCustomerId)?.name + ' - ' + customers.find(c => c.id === selectedCustomerId)?.mobile
                    : "Select a customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                        {customers.map((customer) => (
                        <CommandItem
                            key={customer.id}
                            value={`${customer.name} ${customer.mobile}`}
                            onSelect={() => {
                            setSelectedCustomerId(customer.id);
                            setPopoverOpen(false);
                            router.push(`/admin/modules/dueSell?customerId=${customer.id}`, { shallow: true });
                            }}
                        >
                            {customer.name} - {customer.mobile}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                    </CommandList>
                </Command>
                </PopoverContent>
            </Popover>
            </CardContent>
        </Card>
        {/* Barcode Scan */}
        <Card>
            <CardHeader>
                <CardTitle>Scan Invoice</CardTitle>
                <CardDescription>Scan the barcode on a customer's invoice to load them.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleBarcodeScan}>
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                             <ScanLine className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
                             <Input name="barcode" placeholder="Scan barcode..." className="pl-10" />
                        </div>
                        <Button type="submit">Find</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </div>

      {selectedCustomer && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Due Info & Collection Form */}
          <div className="space-y-6">
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Outstanding Due</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-destructive">৳{totalDue.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record a Collection</CardTitle>
              </CardHeader>
              <form onSubmit={handleCollectionSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="collectionAmount">Amount</Label>
                    <Input
                      id="collectionAmount"
                      ref={collectionAmountInputRef}
                      type="number"
                      step="0.01"
                      value={collectionAmount}
                      onChange={(e) => setCollectionAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Cash payment from John"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Confirm Collection</Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right Column: Payment History */}
          <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <History className="h-6 w-6" />
                    <CardTitle>Payment History</CardTitle>
                </div>
              <CardDescription>A log of all payments made by {selectedCustomer.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {transactionHistory.length > 0 ? (
                  transactionHistory.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                      <div>
                        <p className="font-semibold">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                        {tx.orderNumber && <p className="text-xs text-muted-foreground">Order #{tx.orderNumber}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg">৳{tx.amount.toFixed(2)}</p>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePrintReceipt(tx.collection)}>
                            <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No payment history found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
