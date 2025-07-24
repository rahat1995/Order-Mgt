
'use client';

import React from 'react';
import type { Order, Customer, OrganizationInfo, ServiceJob, ServiceIssue, ServiceType } from '@/types';
import { Package } from 'lucide-react';
import { amountToWords } from '@/lib/amountInWords';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';

interface ServiceInvoiceProps {
  job: ServiceJob;
  order: Order;
  customer: Customer;
  organization: OrganizationInfo;
  issueType?: ServiceIssue;
  serviceType?: ServiceType;
}

const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
};

export const ServiceInvoice = ({ job, order, customer, organization, issueType, serviceType }: ServiceInvoiceProps) => {
  const amountDue = order.total - (order.amountTendered || 0);
  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/status/${job.id}` : '';

  return (
    <div className="bg-white text-black font-sans w-[210mm] min-h-[297mm] mx-auto p-12 print:p-6 print:shadow-none print:m-0">
      {/* Header */}
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-800">
        <div className="flex items-center gap-4">
          {organization.logo ? (
            <img src={organization.logo} alt="Organization Logo" className="h-20 w-20 object-contain" data-ai-hint="company logo" />
          ) : (
            <div className="h-20 w-20 bg-gray-200 flex items-center justify-center rounded-md">
              <Package className="h-10 w-10 text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-sm text-gray-600">{organization.address}</p>
            <p className="text-sm text-gray-600">Tel: {organization.mobile} | Email: {organization.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-semibold uppercase text-gray-800">Invoice</h2>
          <p className="text-md mt-2"><strong>Invoice No:</strong> {order.orderNumber}</p>
          <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(order.createdAt)}</p>
          <p className="text-sm text-gray-600"><strong>Job No:</strong> {job.jobNumber}</p>
        </div>
      </header>

      {/* Customer & Service Info */}
      <section className="mt-8 grid grid-cols-2 gap-8">
        <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Bill To:</h3>
            <div className="text-sm space-y-1">
                <p className="text-base font-bold">{customer.name}</p>
                <p>{customer.address || 'N/A'}</p>
                <p>Mobile: {customer.mobile}</p>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Service Details:</h3>
            <div className="text-sm space-y-1">
                <p><strong>Device:</strong> {job.deviceName} {job.deviceModel && `(${job.deviceModel})`}</p>
                <p><strong>Reported Issue:</strong> {issueType?.name || 'N/A'}</p>
            </div>
        </div>
      </section>

      {/* Itemized Table */}
      <main className="mt-8">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[50px]">Sl.</TableHead>
              <TableHead className="w-3/5">Service / Item Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="align-top">{index + 1}</TableCell>
                <TableCell className="align-top">{item.name}</TableCell>
                <TableCell className="text-center align-top">{item.quantity}</TableCell>
                <TableCell className="text-right align-top">৳{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium align-top">৳{item.subtotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>

       {/* Right Column: QR Code */}
      <div className="mt-8 flex justify-between items-start">
        <div className="w-3/5">
             <section className="pt-4"><p className="text-sm"><strong>In Words:</strong> {amountToWords(order.total)}</p></section>
        </div>
        <div className="w-2/5 flex flex-col items-end gap-4">
             {/* Totals Section */}
            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-medium">৳{order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Discount:</span><span className="font-medium">-৳{order.discountAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span className="text-gray-800">Grand Total:</span><span className="text-gray-800">৳{order.total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm border-t mt-2 pt-2"><span className="text-gray-600">Amount Paid:</span><span className="font-medium">৳{(order.amountTendered || 0).toFixed(2)}</span></div>
              <div className={`flex justify-between text-base font-semibold border-t pt-2 ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                <span>{amountDue > 0 ? "Amount Due:" : "Change:"}</span>
                <span>৳{Math.abs(amountDue).toFixed(2)}</span>
              </div>
            </div>
            <div className="text-center">
                 <div className="p-1 bg-white border rounded-md inline-block">
                    <QRCode value={qrUrl} size={80} />
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Scan to track status</p>
                 <div className="mt-2">
                    <Barcode value={job.jobNumber} height={40} width={1.5} fontSize={12} />
                 </div>
            </div>
        </div>
      </div>
      

      {/* Footer */}
      <footer className="mt-16 pt-8 grid grid-cols-2 gap-8 text-center absolute bottom-12 w-[calc(100%-6rem)]">
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Authorized Signature</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Customer Signature</p></div></div>
      </footer>
    </div>
  );
};
