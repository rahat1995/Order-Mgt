
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import type { Order, Collection, Customer } from '@/types';

type LedgerEntry = {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
};

export function CustomerLedgerClient() {
  const { settings, isLoaded } = useSettings();
  const { customers, orders, collections } = settings;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { ledger, totalDebit, totalCredit, finalBalance } = useMemo(() => {
    if (!selectedCustomerId || !isLoaded) {
      return { ledger: [], totalDebit: 0, totalCredit: 0, finalBalance: 0 };
    }

    const customerOrders = orders.filter(o => o.customerId === selectedCustomerId && o.status !== 'cancelled');
    const customerCollections = collections.filter(c => c.customerId === selectedCustomerId);
    
    const combinedTransactions = [
        ...customerOrders.map(o => ({
            date: o.createdAt,
            type: 'debit' as const,
            amount: o.total,
            particulars: `Sale - Order #${o.orderNumber}`
        })),
        ...customerOrders.filter(o => o.amountTendered && o.amountTendered > 0).map(o => ({
            date: o.createdAt,
            type: 'credit' as const,
            amount: o.amountTendered!,
            particulars: `Payment for Order #${o.orderNumber}`
        })),
        ...customerCollections.map(c => ({
            date: c.date,
            type: 'credit' as const,
            amount: c.amount,
            particulars: `Payment Received (Receipt: ${c.id.slice(0, 8).toUpperCase()})`
        }))
    ];
    
    combinedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    let currentTotalDebit = 0;
    let currentTotalCredit = 0;
    
    const calculatedLedger: LedgerEntry[] = combinedTransactions.map(tx => {
        if (tx.type === 'debit') {
            runningBalance += tx.amount;
            currentTotalDebit += tx.amount;
            return {
                date: new Date(tx.date).toLocaleDateString(),
                particulars: tx.particulars,
                debit: tx.amount,
                credit: 0,
                balance: runningBalance,
            };
        } else { // credit
            runningBalance -= tx.amount;
            currentTotalCredit += tx.amount;
            return {
                date: new Date(tx.date).toLocaleDateString(),
                particulars: tx.particulars,
                debit: 0,
                credit: tx.amount,
                balance: runningBalance,
            };
        }
    });

    return { 
        ledger: calculatedLedger,
        totalDebit: currentTotalDebit,
        totalCredit: currentTotalCredit,
        finalBalance: runningBalance
    };

  }, [selectedCustomerId, orders, collections, isLoaded]);

  if (!isLoaded) {
    return <div>Loading report...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="w-full md:w-1/3">
            <Label>Select Customer</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : "Select a customer..."}
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCustomerId ? (
                ledger.length > 0 ? (
                  <>
                    {ledger.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.particulars}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? `৳${entry.debit.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? `৳${entry.credit.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ৳{entry.balance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2} className="text-right">Total</TableCell>
                        <TableCell className="text-right">৳{totalDebit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">৳{totalCredit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">৳{finalBalance.toFixed(2)}</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No transactions found for this customer.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Please select a customer to view their ledger.
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
