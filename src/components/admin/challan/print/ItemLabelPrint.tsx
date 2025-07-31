
'use client';

import React from 'react';
import type { ChallanItem } from '@/types';
import Barcode from 'react-barcode';

interface ItemLabelPrintProps {
  items: ChallanItem[];
}

export const ItemLabelPrint = ({ items }: ItemLabelPrintProps) => {
  return (
    <div className="bg-white text-black font-sans p-2">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <div className="grid grid-cols-3 gap-2">
        {items.map(item => (
          <div key={item.inventoryItemId} className="border border-black p-2 flex flex-col items-center justify-center text-center break-words">
            <p className="font-bold text-xs">{item.name}</p>
            <p className="text-xs mb-1">{item.serialNumber}</p>
            <Barcode value={item.serialNumber} height={30} width={1} fontSize={10} margin={2} />
          </div>
        ))}
      </div>
    </div>
  );
};
