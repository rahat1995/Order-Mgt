

'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const variant = {
    pending: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
  }[status] as "default" | "secondary" | "destructive" | "outline" | null | undefined;
  return <Badge variant={variant}>{status}</Badge>;
};

const PaymentStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
    const variant = {
        pending: 'destructive',
        paid: 'secondary'
    }[status] as "default" | "secondary" | "destructive" | "outline" | null | undefined;
    return <Badge variant={variant}>{status}</Badge>;
};


export function OrderHistoryClient() {
  const { settings, updateOrder, isLoaded } = useSettings();
  const { orders } = settings;

  const handleUpdateStatus = (order: Order, status: Order['status']) => {
    updateOrder({ ...order, status });
  };
  
  const handleUpdatePaymentStatus = (order: Order, paymentStatus: Order['paymentStatus']) => {
    updateOrder({ ...order, paymentStatus });
  };

  if (!isLoaded) {
    return <div>Loading order history...</div>;
  }
  
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
        {sortedOrders.length > 0 ? (
            sortedOrders.map(order => {
                return (
                    <Card key={order.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Order #{order.orderNumber}</CardTitle>
                                    <CardDescription>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                                    <div className="flex gap-2 justify-end mt-1">
                                        <OrderStatusBadge status={order.status} />
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm">
                                <div>
                                    <p><strong>Customer:</strong> {order.customerName}</p>
                                    {order.customerMobile && <p><strong>Mobile:</strong> {order.customerMobile}</p>}
                                </div>
                                <div className="text-right">
                                    <p><strong>Items:</strong> {order.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
                                    {order.discountAmount > 0 && <p><strong>Discount:</strong> ${order.discountAmount.toFixed(2)}</p>}
                                </div>
                            </div>
                             <details className="mt-2 text-sm">
                                <summary className="cursor-pointer">View Items</summary>
                                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                                    {order.items.map(item => (
                                        <li key={item.id}>{item.quantity}x {item.name} {item.variant ? `(${item.variant.name})` : ''}</li>
                                    ))}
                                </ul>
                            </details>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            {order.paymentStatus === 'pending' && <Button size="sm" onClick={() => handleUpdatePaymentStatus(order, 'paid')}>Mark as Paid</Button>}
                            {order.status === 'pending' && <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(order, 'completed')}>Mark as Completed</Button>}
                            {order.status !== 'cancelled' && <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(order, 'cancelled')}>Cancel Order</Button>}
                        </CardFooter>
                    </Card>
                )
            })
        ) : (
             <Card className="text-center py-12">
                <CardHeader>
                <CardTitle>No Orders Found</CardTitle>
                <CardDescription>Go to "Order Entry" to place your first order.</CardDescription>
                </CardHeader>
            </Card>
        )}
    </div>
  );
}
