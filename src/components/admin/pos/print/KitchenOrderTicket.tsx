
'use client';

import React from 'react';
import type { Order } from '@/types';

interface KitchenOrderTicketProps {
  order: Order;
}

export const KitchenOrderTicket = ({ order }: KitchenOrderTicketProps) => {
  return (
    <div className="p-4 bg-white text-black font-mono text-xs w-[300px]">
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold uppercase">Kitchen Order</h1>
        {order.orderType && <h2 className="text-base font-bold uppercase">{order.orderType}</h2>}
      </div>
      <div className="mb-2 text-sm">
        <p><strong>Order No:</strong> {order.orderNumber}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
      </div>
      <hr className="border-dashed border-black my-2" />
      <table className="w-full">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="text-left text-base pr-2 pb-1">Qty</th>
            <th className="text-left text-base w-full pb-1">Item</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <React.Fragment key={item.id}>
              <tr className="font-bold text-base pt-1">
                <td className="align-top pr-2 pt-1">
                  {item.quantity % 1 !== 0 ? item.quantity.toFixed(2) : item.quantity}x
                </td>
                <td className="align-top pt-1">{item.name}</td>
              </tr>
              {item.variant && (
                <tr>
                  <td></td>
                  <td className="pl-4 text-sm font-normal"> - {item.variant.name}</td>
                </tr>
              )}
              {item.addons?.map(addon => (
                <tr key={addon.id}>
                  <td></td>
                  <td className="pl-4 text-sm font-normal"> + {addon.name}</td>
                </tr>
              ))}
              {index < order.items.length - 1 && (
                <tr>
                  <td colSpan={2}>
                    <div className="border-t border-dashed border-black my-1"></div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
