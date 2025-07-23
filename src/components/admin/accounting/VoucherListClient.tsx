
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { AccountingVoucher, LedgerAccount, OrganizationInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Printer } from 'lucide-react';
import { VoucherPrint } from './print/VoucherPrint';

export function VoucherListClient() {
  const { settings, deleteAccountingVoucher, isLoaded } = useSettings();
  const { accountingVouchers, ledgerAccounts, organization } = settings;
  const [viewingVoucher, setViewingVoucher] = useState<AccountingVoucher | null>(null);
  const [voucherToPrint, setVoucherToPrint] = useState<AccountingVoucher | null>(null);
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
    if (voucherToPrint && printRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(printRef, `Voucher - ${voucherToPrint.voucherNumber}`);
        setVoucherToPrint(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [voucherToPrint]);

  const getLedgerName = (ledgerId: string): string => {
      return ledgerAccounts.find(l => l.id === ledgerId)?.name || 'Unknown Ledger';
  }
  
  const getVoucherTotals = (voucher: AccountingVoucher): { totalDebit: number; totalCredit: number } => {
      let totalDebit = 0;
      let totalCredit = 0;
      voucher.transactions.forEach(tx => {
          if (tx.isDebit) {
              totalDebit += tx.amount;
          } else {
              totalCredit += tx.amount;
          }
      });
      return { totalDebit, totalCredit };
  }

  if (!isLoaded) return <div>Loading vouchers...</div>;
  
  const sortedVouchers = [...accountingVouchers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="hidden">
        {voucherToPrint && (
            <div ref={printRef}>
                <VoucherPrint 
                    voucher={voucherToPrint}
                    organization={organization}
                    ledgerAccounts={ledgerAccounts}
                />
            </div>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Voucher History</CardTitle>
          <CardDescription>A log of all recorded financial vouchers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVouchers.length > 0 ? sortedVouchers.map(voucher => {
                 const { totalDebit } = getVoucherTotals(voucher);
                 return (
                    <TableRow key={voucher.id}>
                        <TableCell>{new Date(voucher.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                        <TableCell><Badge variant="secondary">{voucher.type}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{voucher.narration}</TableCell>
                        <TableCell className="text-right font-semibold">৳{totalDebit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                             <Button variant="outline" size="sm" onClick={() => setVoucherToPrint(voucher)}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAccountingVoucher(voucher.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                 )
              }) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No vouchers recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
