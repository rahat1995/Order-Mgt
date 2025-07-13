
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Minus, Search } from 'lucide-react';
import type { Order, OrderItem, ServiceItem, ServiceJob, Customer } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export function ServiceBillingClient() {
  const { settings, addOrder, updateServiceJob, isLoaded } = useSettings();
  const { serviceItemCategories, serviceItems, customers } = settings;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [serviceJob, setServiceJob] = useState<ServiceJob | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  
  const [manualDiscountType, setManualDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [amountTendered, setAmountTendered] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [animatingItem, setAnimatingItem] = useState<{x: number; y: number} | null>(null);
  
  const cartPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && isLoaded) {
      const job = settings.serviceJobs.find(j => j.id === jobId);
      if (job) {
        setServiceJob(job);
        const cust = settings.customers.find(c => c.id === job.customerId);
        setCustomer(cust || null);
      } else {
        alert('Service Job not found!');
        router.push('/admin/modules/serviceJob/all');
      }
    }
  }, [searchParams, isLoaded, settings.serviceJobs, settings.customers, router]);

  const addToCart = (item: ServiceItem) => {
    const existingItemIndex = currentOrderItems.findIndex(i => i.itemId === item.id);

    if (existingItemIndex > -1) {
      const updatedItems = [...currentOrderItems];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + 1;
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        subtotal: newQuantity * existingItem.unitPrice,
      }
      setCurrentOrderItems(updatedItems);
    } else {
      const orderItem: OrderItem = {
          id: uuidv4(),
          itemId: item.id,
          name: item.name,
          description: '',
          basePrice: item.price,
          unitPrice: item.price,
          quantity: 1,
          subtotal: item.price,
      }
      setCurrentOrderItems(prevItems => [...prevItems, orderItem]);
    }
  };

  const handleItemClick = (item: ServiceItem, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnimatingItem({
        x: rect.left,
        y: rect.top
    });
    addToCart(item);
  };
  
  const updateOrderItemQuantity = (itemId: string, delta: number) => {
    setCurrentOrderItems(prevItems => {
        const itemIndex = prevItems.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return prevItems;

        const updatedItems = [...prevItems];
        const item = updatedItems[itemIndex];
        const newQuantity = item.quantity + delta;

        if (newQuantity <= 0) {
            return updatedItems.filter(i => i.id !== itemId);
        }

        updatedItems[itemIndex] = {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.unitPrice,
        };
        return updatedItems;
    });
  };

  const { subtotal, discount, total, changeDue } = useMemo(() => {
    const currentSubtotal = currentOrderItems.reduce((total, item) => total + item.subtotal, 0);
    let discountAmount = 0;
    
    const manualDiscountInput = parseFloat(manualDiscountValue);

    if (!isNaN(manualDiscountInput) && manualDiscountInput > 0) {
        if (manualDiscountType === 'fixed') {
            discountAmount = manualDiscountInput;
        } else {
            discountAmount = (currentSubtotal * manualDiscountInput) / 100;
        }
    }
    
    const currentTotal = Math.max(0, currentSubtotal - discountAmount);
    const tendered = parseFloat(amountTendered);
    const currentChangeDue = !isNaN(tendered) && tendered >= currentTotal ? tendered - currentTotal : 0;

    return { 
        subtotal: currentSubtotal, 
        discount: discountAmount, 
        total: currentTotal,
        changeDue: currentChangeDue
    };
  }, [currentOrderItems, manualDiscountValue, manualDiscountType, amountTendered]);

  const handleFinalizeBill = () => {
    if (!serviceJob || !customer || currentOrderItems.length === 0) {
        alert('Cannot create an empty bill.');
        return;
    }

    const tenderedAmount = parseFloat(amountTendered);
    const paymentStatus = !isNaN(tenderedAmount) && tenderedAmount >= total ? 'paid' : 'pending';

    const orderData: Omit<Order, 'id' | 'orderNumber'> = {
        items: currentOrderItems,
        customerId: customer.id,
        customerName: customer.name,
        customerMobile: customer.mobile,
        status: 'completed',
        paymentStatus: paymentStatus,
        orderType: 'delivery', // Using delivery as a proxy for service
        subtotal: subtotal,
        discountAmount: discount,
        discountType: discount > 0 ? 'manual' : undefined,
        total: total,
        amountTendered: !isNaN(tenderedAmount) ? tenderedAmount : undefined,
        changeDue: changeDue > 0 ? changeDue : undefined,
        createdAt: new Date().toISOString(),
        serviceJobId: serviceJob.id,
    };
    
    const newOrder = addOrder(orderData);
    updateServiceJob({ ...serviceJob, orderId: newOrder.id });

    alert(`Bill created successfully for Job #${serviceJob.jobNumber}!`);
    router.push('/admin/modules/serviceJob/all');
  }
  
  const filteredServiceItems = useMemo(() => {
    if (!searchQuery) return serviceItems;
    return serviceItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [serviceItems, searchQuery]);

  if (!isLoaded || !serviceJob || !customer) return <div>Loading...</div>;
  
  const ServiceItemCard = ({item, onClick}: {item: ServiceItem, onClick: (e: React.MouseEvent<HTMLDivElement>) => void}) => (
     <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col p-3">
        <h3 className="font-semibold text-sm flex-grow">{item.name}</h3>
        <p className="text-xs text-muted-foreground mt-auto pt-1">৳{item.price.toFixed(2)}</p>
      </Card>
  );

  return (
    <>
      <AnimatePresence>
        {animatingItem && cartPanelRef.current && (
          <motion.div
            initial={{ 
              x: animatingItem.x, 
              y: animatingItem.y, 
              opacity: 0.8, 
              position: 'fixed', 
              zIndex: 100, 
              borderRadius: '0.5rem',
              width: '100px',
              height: '50px',
              backgroundColor: 'hsl(var(--primary))'
            }}
            animate={{
              x: cartPanelRef.current.getBoundingClientRect().x + 20,
              y: cartPanelRef.current.getBoundingClientRect().y + 20,
              width: '20px',
              height: '15px',
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onAnimationComplete={() => setAnimatingItem(null)}
            className="object-cover"
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr,450px] gap-6">
        <div className="flex flex-col h-[calc(100vh-12rem)]">
         <div className="p-1 mb-4 flex-shrink-0">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search services and parts..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
         </div>
            <Tabs defaultValue={serviceItemCategories[0]?.id || ''} className="flex-grow flex flex-col overflow-hidden">
                <TabsList className="flex-shrink-0 overflow-x-auto justify-start">
                {serviceItemCategories.map(category => (
                    <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
                ))}
                </TabsList>
                <div className="flex-grow overflow-y-auto mt-2">
                    {serviceItemCategories.map(category => (
                    <TabsContent key={category.id} value={category.id} className="m-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                        {filteredServiceItems.filter(item => item.categoryId === category.id).map(item => (
                           <ServiceItemCard key={item.id} item={item} onClick={(e) => handleItemClick(item, e)} />
                        ))}
                        </div>
                    </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>

        <div>
          <div className="sticky top-6">
            <Card ref={cartPanelRef}>
                <CardHeader>
                <h2 className="text-2xl font-bold">Bill for Job #{serviceJob.jobNumber}</h2>
                <CardDescription>Customer: {customer.name} ({customer.mobile})</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2 max-h-72 overflow-y-auto">
                    {currentOrderItems.length > 0 ? (
                    currentOrderItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm p-1 rounded-md hover:bg-muted/50">
                            <span className="flex-grow font-semibold truncate" title={item.name}>{item.name}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateOrderItemQuantity(item.id, -1)}><Minus className="h-3 w-3"/></Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateOrderItemQuantity(item.id, 1)}><Plus className="h-3 w-3"/></Button>
                            </div>
                            <div className="flex items-center gap-1">
                            <span className="w-20 text-right font-medium">৳{item.subtotal.toFixed(2)}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 text-destructive" onClick={() => updateOrderItemQuantity(item.id, -item.quantity)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                    ) : (
                    <p className="text-sm text-center text-muted-foreground py-10">Select services or parts to add to the bill.</p>
                    )}
                </div>
                
                <div className="space-y-2 border-t pt-4">
                    <div className="flex gap-2 items-center">
                        <Input placeholder="Manual Discount" type="number" value={manualDiscountValue} onChange={e => setManualDiscountValue(e.target.value)} className="h-8 flex-grow"/>
                        <Select value={manualDiscountType} onValueChange={(v) => setManualDiscountType(v as any)}>
                            <SelectTrigger className="w-[120px] h-8 flex-shrink-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixed (৳)</SelectItem>
                                <SelectItem value="percentage">Percent (%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-4 space-y-2 border-t">
                    <div className="flex justify-between text-sm"><p>Subtotal</p> <p>৳{subtotal.toFixed(2)}</p></div>
                    <div className="flex justify-between text-sm text-destructive">
                        <p>Discount</p> 
                        <p>-৳{discount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg"><p>Total</p> <p>৳{total.toFixed(2)}</p></div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label>Amount Paid</Label>
                            <Input placeholder="0.00" type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Amount Due</p>
                            <p className="text-2xl font-bold text-destructive">৳{(total - parseFloat(amountTendered || '0')).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t">
                    <div className="grid grid-cols-1 gap-2">
                    <Button onClick={handleFinalizeBill} className="w-full">Submit Bill</Button>
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

    