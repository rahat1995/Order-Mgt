
'use client';

import React from 'react';
import type { Order, OrganizationInfo } from '@/types';
import { amountToWords } from '@/lib/amountInWords';

interface CustomerReceiptProps {
  order: Order;
  organization: OrganizationInfo;
}

export const CustomerReceipt = ({ order, organization }: CustomerReceiptProps) => {
  return (
    <div className="p-4 bg-white text-black font-mono text-xs w-[300px]">
      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">{organization.name}</h1>
        <p>{organization.address}</p>
        <p>Ph: {organization.mobile}</p>
      </div>
      <div className="mb-2">
        <p>Order No: {order.orderNumber}</p>
        <p>Customer: {order.customerName}</p>
        {order.customerMobile && <p>Mobile: {order.customerMobile}</p>}
        {order.orderType && <p>Type: <span className="uppercase font-semibold">{order.orderType}</span></p>}
      </div>
      <div className="border-t border-solid border-black my-2" />
      <table className="w-full table-auto border-collapse border border-solid border-black">
        <thead>
          <tr className="border-b-2 border-solid border-black">
            <th className="text-left p-1 border-r border-solid border-black">Sl.</th>
            <th className="text-left p-1 w-2/5 border-r border-solid border-black">Item</th>
            <th className="text-center p-1 border-r border-solid border-black">Qty</th>
            <th className="text-right p-1 border-r border-solid border-black">Rate</th>
            <th className="text-right p-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item.id} className="border-b border-solid border-black/50">
              <td className="text-left align-top p-1 border-r border-solid border-black/50">{index + 1}.</td>
              <td className="text-left align-top p-1 border-r border-solid border-black/50">
                {item.name}
                {item.variant && <div className="pl-2 text-gray-700">- {item.variant.name}</div>}
                {item.addons?.map(addon => <div key={addon.id} className="pl-2 text-gray-700">+ {addon.name}</div>)}
              </td>
              <td className="text-center align-top p-1 border-r border-solid border-black/50">{item.quantity % 1 !== 0 ? item.quantity.toFixed(2) : item.quantity}</td>
              <td className="text-right align-top p-1 border-r border-solid border-black/50">৳{item.unitPrice.toFixed(2)}</td>
              <td className="text-right align-top p-1">৳{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-solid border-black my-2" />
      <div className="space-y-1">
        <div className="flex justify-between"><p>Subtotal:</p> <p>৳{order.subtotal.toFixed(2)}</p></div>
        {order.discountAmount > 0 && <div className="flex justify-between"><p>Discount:</p> <p>-৳{order.discountAmount.toFixed(2)}</p></div>}
        <div className="flex justify-between font-bold text-sm"><p>GRAND TOTAL:</p> <p>৳{order.total.toFixed(2)}</p></div>
        <div className="border-t border-solid border-black my-1" />
        {order.amountTendered && <div className="flex justify-between"><p>Tendered:</p> <p>৳{order.amountTendered.toFixed(2)}</p></div>}
        {order.changeDue && <div className="flex justify-between"><p>Change:</p> <p>৳{order.changeDue.toFixed(2)}</p></div>}
      </div>
      <div className="border-t border-solid border-black my-2" />
      <div className="pt-1 text-xs">
        <p><span className="font-semibold">In Words:</span> {amountToWords(order.total)}</p>
      </div>
      <div className="border-t border-solid border-black my-2" />
      {organization.receiptFooter && <p className="text-center mt-4">{organization.receiptFooter}</p>}
    </div>
  );
};
