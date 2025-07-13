
'use client';

import React from 'react';
import type { Collection, Customer, OrganizationInfo } from '@/types';
import { amountToWords } from '@/lib/amountInWords';
import { Package } from 'lucide-react';

interface MoneyReceiptProps {
  collection: Collection;
  customer: Customer;
  organization: OrganizationInfo;
}

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const MoneyReceipt = ({ collection, customer, organization }: MoneyReceiptProps) => {
  return (
    <div className="bg-white text-black font-sans w-[210mm] min-h-[148mm] mx-auto p-8 border-2 border-dashed border-gray-400 print:border-none print:p-0">
      <div className="border-2 border-black p-6 relative">
        {/* Header */}
        <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
          <div className="flex items-center gap-4">
            {organization.logo ? (
              <img src={organization.logo} alt="Logo" className="h-16 w-16 object-contain" data-ai-hint="company logo" />
            ) : (
                <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded-md">
                    <Package className="h-8 w-8 text-gray-500" />
                </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-xs text-gray-600">{organization.address}</p>
              <p className="text-xs text-gray-600">Tel: {organization.mobile}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold uppercase text-gray-700">Money Receipt</h2>
            <p className="text-sm mt-1"><strong>Receipt No:</strong> {collection.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(collection.date)}</p>
          </div>
        </header>
        
        {/* Body */}
        <main className="mt-6 text-base space-y-4">
          <div className="flex items-baseline">
            <p className="w-40 font-semibold">Received with thanks from</p>
            <p className="flex-1 border-b border-dotted border-gray-500 font-bold px-2">{customer.name}</p>
          </div>
          <div className="flex items-baseline">
            <p className="w-40 font-semibold">Address</p>
            <p className="flex-1 border-b border-dotted border-gray-500 px-2">{customer.address || 'N/A'}</p>
          </div>
           <div className="flex items-baseline">
            <p className="w-40 font-semibold">Mobile Number</p>
            <p className="flex-1 border-b border-dotted border-gray-500 px-2">{customer.mobile}</p>
          </div>
           <div className="flex items-baseline">
            <p className="w-40 font-semibold">The sum of</p>
            <p className="flex-1 border-b border-dotted border-gray-500 px-2 capitalize">{amountToWords(collection.amount)}</p>
          </div>
          <div className="flex items-baseline">
            <p className="w-40 font-semibold">On account of</p>
            <p className="flex-1 border-b border-dotted border-gray-500 px-2">{collection.notes || 'Payment against outstanding dues'}</p>
          </div>
        </main>
        
        {/* Amount Box */}
        <div className="absolute top-1/3 right-8 transform -translate-y-1/2">
            <div className="border-2 border-black p-2 text-center w-48">
                <label className="text-sm font-semibold block border-b-2 border-black mb-2 pb-1">Amount</label>
                <p className="text-2xl font-bold py-2">৳{collection.amount.toFixed(2)}</p>
            </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 flex justify-between items-end">
            <div>
                 <p className="text-xs text-gray-500">Note: This is a computer-generated receipt and does not require a physical signature.</p>
            </div>
            <div className="text-center">
                <div className="border-t-2 border-gray-400 border-dotted pt-2 w-48">
                    <p className="font-semibold">Authorized Signature</p>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
};
