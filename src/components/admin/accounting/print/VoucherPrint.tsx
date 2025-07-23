

'use client';

import React, { useMemo } from 'react';
import type { AccountingVoucher, LedgerAccount, OrganizationInfo } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { amountToWords } from '@/lib/amountInWords';
import { Package } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface VoucherPrintProps {
  voucher: AccountingVoucher;
  organization: OrganizationInfo;
  ledgerAccounts: LedgerAccount[];
}

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};

export const VoucherPrint = ({ voucher, organization, ledgerAccounts }: VoucherPrintProps) => {
  const { settings } = useSettings();
  const { designations } = settings;
  const { voucherApprovalLevels } = settings.accountingSettings;

  const preparedBy = designations.find(d => d.id === voucherApprovalLevels?.preparedBy)?.name || 'Prepared By';
  const reviewedBy = designations.find(d => d.id === voucherApprovalLevels?.reviewedBy)?.name || 'Reviewed By';
  const approvedBy = designations.find(d => d.id === voucherApprovalLevels?.approvedBy)?.name || 'Approved By';

  const getLedgerName = (ledgerId: string): string => {
    return ledgerAccounts.find(l => l.id === ledgerId)?.name || 'Unknown Ledger';
  }

  const { totalDebit, totalCredit } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    voucher.transactions.forEach(tx => {
      if (tx.isDebit) debit += tx.amount;
      else credit += tx.amount;
    });
    return { totalDebit: debit, totalCredit: credit };
  }, [voucher.transactions]);
  
  const voucherTitleMap = {
      Payment: 'Payment Voucher',
      Receipt: 'Receipt Voucher',
      Contra: 'Contra Voucher',
      Journal: 'Journal Voucher',
  };

  return (
    <div className="bg-white text-black font-sans w-[210mm] min-h-[148.5mm] mx-auto p-12 print:p-6 print:shadow-none print:m-0 flex flex-col">
      <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
        <div className="flex items-center gap-4">
          {organization.logo ? (
            <img src={organization.logo} alt="Organization Logo" className="h-16 w-16 object-contain" data-ai-hint="company logo" />
          ) : (
            <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded-md"><Package className="h-8 w-8 text-gray-500" /></div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-xs text-gray-600">{organization.address}</p>
            <p className="text-xs text-gray-600">Tel: {organization.mobile} | Email: {organization.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold uppercase text-gray-800">{voucherTitleMap[voucher.type]}</h2>
        </div>
      </header>
       <section className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Voucher No:</strong> {voucher.voucherNumber}</p>
          </div>
          <div className="text-right">
             <p><strong>Date:</strong> {formatDate(voucher.date)}</p>
          </div>
      </section>

      <main className="mt-4 flex-grow">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 text-sm">
              <TableHead className="w-2/5">Account Head</TableHead>
              <TableHead>Narration</TableHead>
              <TableHead className="text-right w-[120px]">Debit</TableHead>
              <TableHead className="text-right w-[120px]">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {voucher.transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="align-top font-semibold">{getLedgerName(tx.ledgerId)}</TableCell>
                <TableCell className="align-top text-gray-700">{tx.narration || voucher.narration}</TableCell>
                <TableCell className="text-right align-top">{tx.isDebit ? `৳${tx.amount.toFixed(2)}` : '-'}</TableCell>
                <TableCell className="text-right align-top">{!tx.isDebit ? `৳${tx.amount.toFixed(2)}` : '-'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-gray-100">
                <TableCell colSpan={2} className="text-right">Total</TableCell>
                <TableCell className="text-right">৳{totalDebit.toFixed(2)}</TableCell>
                <TableCell className="text-right">৳{totalCredit.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
      
      <section className="mt-4 pt-4 border-t">
        <p className="text-sm"><strong>In Words:</strong> {amountToWords(totalDebit)}</p>
      </section>
      
      <footer className="mt-auto pt-16 grid grid-cols-3 gap-8 text-center text-xs">
        <div><div className="border-t-2 border-gray-400 pt-2"><p>{preparedBy}</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>{reviewedBy}</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>{approvedBy}</p></div></div>
      </footer>
    </div>
  );
};
