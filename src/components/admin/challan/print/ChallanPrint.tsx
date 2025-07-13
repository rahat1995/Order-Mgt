
'use client';

import React, { useMemo } from 'react';
import type { Challan, Customer, OrganizationInfo } from '@/types';
import { Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/context/SettingsContext';

interface ChallanPrintProps {
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

const PrintableChallan = ({ challan, customer, organization, copyType }: ChallanPrintProps & { copyType: 'Office Copy' | 'Customer Copy' }) => {
  const { settings } = useSettings();

  const groupedItems = useMemo(() => {
    const map = new Map<string, { name: string; price: number; serials: string[] }>();
    challan.items.forEach(item => {
      const product = settings.products.find(p => p.id === item.productId);
      if (!product) return;

      if (!map.has(item.productId)) {
        map.set(item.productId, {
          name: product.name,
          price: product.price,
          serials: [],
        });
      }
      map.get(item.productId)!.serials.push(item.serialNumber);
    });
    return Array.from(map.values());
  }, [challan.items, settings.products]);
  
  const { printOfficeCopyWithPrice } = settings.challanSettings;
  const withPrice = copyType === 'Office Copy' && printOfficeCopyWithPrice;
  const totalAmount = withPrice ? groupedItems.reduce((acc, item) => acc + item.price * item.serials.length, 0) : 0;


  return (
    <div className="w-full h-full flex flex-col">
      <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
        <div className="flex items-center gap-4">
          {organization.logo ? (
            <img src={organization.logo} alt="Organization Logo" className="h-16 w-16 object-contain" data-ai-hint="company logo" />
          ) : (
            <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded-md"><Package className="h-8 w-8 text-gray-500" /></div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
            <p className="text-xs text-gray-600">{organization.address}</p>
            <p className="text-xs text-gray-600">Tel: {organization.mobile} | Email: {organization.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-semibold uppercase text-gray-800">Delivery Challan</h1>
          <p className="text-sm uppercase font-bold text-gray-600 mt-1">{copyType}</p>
        </div>
      </header>
       <section className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p><strong>Challan No:</strong> {challan.challanNumber}</p>
            <p><strong>Date:</strong> {formatDate(challan.createdAt)}</p>
          </div>
          <div className="text-right">
             <p><strong>Delivery To:</strong></p>
             <p className="font-semibold">{challan.deliveryLocation || customer.address || 'N/A'}</p>
          </div>
      </section>
      <section className="mt-4 border-t border-b py-2">
         <h3 className="text-sm font-semibold">Recipient:</h3>
          <div className="text-xs">
              <p className="font-bold">{customer.name}</p>
              <p>{customer.address || 'N/A'}</p>
              <p>Mobile: {customer.mobile}</p>
          </div>
      </section>

      <main className="mt-4 flex-grow">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 text-xs">
              <TableHead className="w-[40px]">Sl.</TableHead>
              <TableHead className="w-1/3">Product Description</TableHead>
              <TableHead className="text-center w-[50px]">Qty</TableHead>
              <TableHead>Serial Numbers</TableHead>
              {withPrice && <TableHead className="text-right">Unit Price</TableHead>}
              {withPrice && <TableHead className="text-right">Total Price</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {groupedItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="align-top">{index + 1}</TableCell>
                <TableCell className="align-top">{item.name}</TableCell>
                <TableCell className="align-top text-center">{item.serials.length}</TableCell>
                <TableCell className="font-mono leading-tight align-top">{item.serials.join(', ')}</TableCell>
                {withPrice && <TableCell className="text-right align-top">৳{item.price.toFixed(2)}</TableCell>}
                {withPrice && <TableCell className="text-right align-top">৳{(item.price * item.serials.length).toFixed(2)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
      
      {withPrice && (
       <section className="mt-4 flex justify-end">
         <div className="w-1/2 space-y-2 text-sm">
            <div className="flex justify-between text-base font-bold border-t pt-2">
                <span>Total Value:</span>
                <span>৳{totalAmount.toFixed(2)}</span>
            </div>
         </div>
       </section>
      )}
      
      <footer className="mt-auto pt-8 grid grid-cols-3 gap-8 text-center text-xs">
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Prepared By</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Authorized By</p></div></div>
        <div><div className="border-t-2 border-gray-400 pt-2"><p>Received By (Seal & Sign)</p></div></div>
      </footer>
    </div>
  );
};


export const ChallanPrint = ({ challan, customer, organization }: ChallanPrintProps) => {
  const { settings, isLoaded } = useSettings();

  if (!isLoaded) {
    return <div>Loading print settings...</div>;
  }

  const { printWithOfficeCopy } = settings.challanSettings;
  
  return (
    <div className="bg-white text-black font-sans w-[210mm] min-h-[297mm] mx-auto print:shadow-none print:m-0">
      {printWithOfficeCopy && (
        <div className="p-10 print:p-6 h-[148.5mm] flex flex-col">
          <PrintableChallan
            challan={challan}
            customer={customer}
            organization={organization}
            copyType="Office Copy"
          />
        </div>
      )}

      {printWithOfficeCopy && <hr className="border-t-2 border-dashed border-gray-400 mx-10 print:mx-6" />}

      <div className={`p-10 print:p-6 ${printWithOfficeCopy ? 'h-[148.5mm]' : 'h-full'} flex flex-col`}>
         <PrintableChallan
          challan={challan}
          customer={customer}
          organization={organization}
          copyType="Customer Copy"
        />
      </div>
    </div>
  );
};
