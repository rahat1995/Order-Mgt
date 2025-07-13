
'use client';

import React from 'react';
import type { Order, OrganizationInfo } from '@/types';
import { CustomerReceipt } from './CustomerReceipt';
import { KitchenOrderTicket } from './KitchenOrderTicket';

interface KitchenTicketProps {
  order: Order;
  organization: OrganizationInfo;
}

// This component renders a customer copy and a kitchen copy on a single page.
export const KitchenTicket = ({ order, organization }: KitchenTicketProps) => {
  return (
    <>
      <CustomerReceipt order={order} organization={organization} />
      <hr className="border-t-2 border-dashed border-black my-4" />
      <KitchenOrderTicket order={order} />
    </>
  );
};
