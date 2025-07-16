
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { AccountingVoucher, LedgerAccount } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2 } from 'lucide-react';

export function VoucherListClient() {
  const { settings, deleteAccountingVoucher, isLoaded } = useSettings();
  const { accountingVouchers, ledgerAccounts } = settings;
  const [viewingVoucher, setViewingVoucher] = useState<AccountingVoucher | null>(null);

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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingVoucher(voucher)}>
                                <Eye className="h-4 w-4" />
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

      <Dialog open={!!viewingVoucher} onOpenChange={(open) => !open && setViewingVoucher(null)}>
        <DialogContent className="max-w-2xl">
            {viewingVoucher && (
                <>
                    <DialogHeader>
                        <DialogTitle>Voucher Details: {viewingVoucher.voucherNumber}</DialogTitle>
                        <DialogDescription>
                            {viewingVoucher.type} voucher recorded on {new Date(viewingVoucher.date).toLocaleDateString()}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {viewingVoucher.narration && <p className="text-sm p-2 bg-muted rounded-md"><strong>Narration:</strong> {viewingVoucher.narration}</p>}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ledger</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewingVoucher.transactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <p>{getLedgerName(tx.ledgerId)}</p>
                                            {tx.narration && <p className="text-xs text-muted-foreground pl-2">- {tx.narration}</p>}
                                        </TableCell>
                                        <TableCell className="text-right">{tx.isDebit ? `৳${tx.amount.toFixed(2)}` : '-'}</TableCell>
                                        <TableCell className="text-right">{!tx.isDebit ? `৳${tx.amount.toFixed(2)}` : '-'}</TableCell>
                                    </TableRow>
                                ))}
                                 <TableRow className="font-bold bg-muted">
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">৳{getVoucherTotals(viewingVoucher).totalDebit.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">৳{getVoucherTotals(viewingVoucher).totalCredit.toFixed(2)}</TableCell>
                                 </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
