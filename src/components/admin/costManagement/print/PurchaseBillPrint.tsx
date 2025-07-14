
'use client';

import React from 'react';
import type { SupplierBill, Supplier, OrganizationInfo } from '@/types';
import { Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { amountToWords } from '@/lib/amountInWords';

interface PurchaseBillPrintProps {
  bill: SupplierBill;
  supplier: Supplier;
  organization: OrganizationInfo;
}

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};

export const PurchaseBillPrint = ({ bill, supplier, organization }: PurchaseBillPrintProps) => {
  const dueAmount = bill.totalAmount - bill.paidAmount;

  return (
    <div className="bg-white text-black font-sans w-[210mm] min-h-[297mm] mx-auto p-12 print:p-6 print:shadow-none print:m-0">
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-800">
        <div className="flex items-center gap-4">
          {organization.logo ? (
            <img src={organization.logo} alt="Organization Logo" className="h-20 w-20 object-contain" data-ai-hint="company logo" />
          ) : (
            <div className="h-20 w-20 bg-gray-200 flex items-center justify-center rounded-md"><Package className="h-10 w-10 text-gray-500" /></div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-sm text-gray-600">{organization.address}</p>
            <p className="text-sm text-gray-600">Tel: {organization.mobile} | Email: {organization.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-semibold uppercase text-gray-800">Purchase Bill</h2>
          <p className="text-md mt-2"><strong>Bill No:</strong> {bill.billNumber || 'N/A'}</p>
          <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(bill.date)}</p>
        </div>
      </header>
      
      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Supplier:</h3>
        <div className="text-sm space-y-1">
            <p className="text-base font-bold">{supplier.name}</p>
            <p>{supplier.address || 'N/A'}</p>
            <p>Mobile: {supplier.mobile}</p>
        </div>
      </section>

      <main className="mt-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[50px]">Sl.</TableHead>
              <TableHead className="w-2/5">Item Description</TableHead>
              <TableHead className="text-center">Unit</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Cost/Unit</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="align-top">{index + 1}</TableCell>
                <TableCell className="align-top">{item.name}</TableCell>
                <TableCell className="text-center align-top">{item.unit}</TableCell>
                <TableCell className="text-center align-top">{item.quantity}</TableCell>
                <TableCell className="text-right align-top">৳{item.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium align-top">৳{(item.quantity * item.cost).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
      
      <section className="mt-8 flex justify-end">
        <div className="w-1/2 space-y-3">
          <div className="flex justify-between text-lg font-bold border-t pt-2"><span className="text-gray-800">Grand Total:</span><span className="text-gray-800">৳{bill.totalAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm border-t mt-2 pt-2"><span className="text-gray-600">Amount Paid:</span><span className="font-medium">৳{bill.paidAmount.toFixed(2)}</span></div>
          <div className={`flex justify-between text-base font-semibold border-t pt-2 ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            <span>Amount Due:</span>
            <span>৳{dueAmount.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="mt-4 pt-4 border-t"><p className="text-sm"><strong>In Words:</strong> {amountToWords(bill.totalAmount)}</p></section>
       {bill.notes && <section className="mt-4 pt-4 border-t"><p className="text-sm"><strong>Notes:</strong> {bill.notes}</p></section>}
      
      <footer className="mt-24 pt-8 grid grid-cols-2 gap-8 text-center absolute bottom-12 w-[calc(100%-6rem)]">
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Supplier Signature</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Received By</p></div></div>
      </footer>
    </div>
  );
};
