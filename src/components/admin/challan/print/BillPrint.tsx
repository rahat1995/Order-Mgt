
'use client';

import React, { useMemo } from 'react';
import type { Order, Customer, OrganizationInfo, Challan } from '@/types';
import { Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { amountToWords } from '@/lib/amountInWords';

interface BillPrintProps {
  order: Order;
  challan: Challan;
  customer: Customer;
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

export const BillPrint = ({ order, challan, customer, organization }: BillPrintProps) => {
  const amountDue = order.total - (order.amountTendered || 0);

  const groupedItems = useMemo(() => {
    const map = new Map<string, { name: string; unitPrice: number; quantity: number; subtotal: number; serials: string[] }>();
    
    order.items.forEach(item => {
      const key = item.itemId; // Assuming itemId is the product ID
      if (!map.has(key)) {
        map.set(key, {
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: 0,
          subtotal: 0,
          serials: [],
        });
      }
      const group = map.get(key)!;
      group.quantity += item.quantity;
      group.subtotal += item.subtotal;
      if (item.serialNumber) {
        group.serials.push(item.serialNumber);
      }
    });

    return Array.from(map.values());
  }, [order.items]);


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
          <h2 className="text-3xl font-semibold uppercase text-gray-800">Invoice / Bill</h2>
          <p className="text-md mt-2"><strong>Bill No:</strong> {order.orderNumber}</p>
          <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(order.createdAt)}</p>
          <p className="text-sm text-gray-600"><strong>Challan No:</strong> {challan.challanNumber}</p>
        </div>
      </header>
      
      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Bill To:</h3>
        <div className="text-sm space-y-1">
            <p className="text-base font-bold">{customer.name}</p>
            <p>{customer.address || 'N/A'}</p>
            <p>Mobile: {customer.mobile}</p>
        </div>
      </section>

      <main className="mt-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[50px]">Sl.</TableHead>
              <TableHead className="w-3/5">Product Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="align-top">{index + 1}</TableCell>
                <TableCell className="align-top">
                  {item.name}
                  {item.serials.length > 0 && (
                    <span className="block text-xs font-mono text-gray-600 pt-1">
                      ({item.serials.join(', ')})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center align-top">{item.quantity}</TableCell>
                <TableCell className="text-right align-top">৳{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium align-top">৳{item.subtotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
      
      <section className="mt-8 flex justify-end">
        <div className="w-1/2 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-medium">৳{order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Discount:</span><span className="font-medium">-৳{order.discountAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-bold border-t pt-2"><span className="text-gray-800">Grand Total:</span><span className="text-gray-800">৳{order.total.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm border-t mt-2 pt-2"><span className="text-gray-600">Amount Paid:</span><span className="font-medium">৳{(order.amountTendered || 0).toFixed(2)}</span></div>
          <div className={`flex justify-between text-base font-semibold border-t pt-2 ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            <span>{amountDue > 0 ? "Amount Due:" : "Change:"}</span>
            <span>৳{Math.abs(amountDue).toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="mt-4 pt-4 border-t"><p className="text-sm"><strong>In Words:</strong> {amountToWords(order.total)}</p></section>
      
      <footer className="mt-24 pt-8 grid grid-cols-2 gap-8 text-center absolute bottom-12 w-[calc(100%-6rem)]">
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Authorized Signature</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Customer Signature</p></div></div>
      </footer>
    </div>
  );
};
