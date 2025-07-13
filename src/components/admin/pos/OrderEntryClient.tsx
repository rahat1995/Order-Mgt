
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, XCircle, Check, Plus, Minus, Search, Pencil } from 'lucide-react';
import type { Order, OrderItem, MenuItem, MenuItemVariant, MenuItemAddOn, Voucher, Customer } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { CustomerReceipt } from './print/CustomerReceipt';
import { KitchenTicket } from './print/KitchenTicket';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

type AppliedDiscount = {
    type: 'loyal' | 'voucher' | 'manual';
    description: string;
};

export function OrderEntryClient() {
  const { settings, addOrder, updateOrder, isLoaded } = useSettings();
  const { menuCategories, menuItems, customers, vouchers, organization, posSettings } = settings;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [manualDiscountType, setManualDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [amountTendered, setAmountTendered] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemOptionsDialogOpen, setItemOptionsDialogOpen] = useState(false);
  const [priceEditDialogOpen, setPriceEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editingPriceItem, setEditingPriceItem] = useState<OrderItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(undefined);
  const [selectedAddOns, setSelectedAddOns] = useState<MenuItemAddOn[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [animatingItem, setAnimatingItem] = useState<{src: string; x: number; y: number} | null>(null);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const kitchenTicketRef = useRef<HTMLDivElement>(null);
  const cartPanelRef = useRef<HTMLDivElement>(null);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const customerMobileInputRef = useRef<HTMLInputElement>(null);
  const voucherCodeInputRef = useRef<HTMLInputElement>(null);
  const manualDiscountInputRef = useRef<HTMLInputElement>(null);
  const amountTenderedInputRef = useRef<HTMLInputElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const printCustomerButtonRef = useRef<HTMLButtonElement>(null);
  const printKitchenButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      
      e.preventDefault();
      
      switch (e.key.toLowerCase()) {
        case 'n':
          customerNameInputRef.current?.focus();
          break;
        case 'm':
          customerMobileInputRef.current?.focus();
          break;
        case 'v':
          voucherCodeInputRef.current?.focus();
          break;
        case 'd':
          manualDiscountInputRef.current?.focus();
          break;
        case 't':
          amountTenderedInputRef.current?.focus();
          break;
        case 's':
           saveButtonRef.current?.click();
           break;
        case 'c':
          clearButtonRef.current?.click();
          break;
        case 'z':
          printCustomerButtonRef.current?.click();
          break;
        case 'x':
          printKitchenButtonRef.current?.click();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && isLoaded) {
      const orderToEdit = settings.orders.find(o => o.id === orderId);
      if (orderToEdit) {
        setEditingOrder(orderToEdit);
        setCurrentOrderItems(orderToEdit.items);
        setCustomerName(orderToEdit.customerName);
        setCustomerMobile(orderToEdit.customerMobile || '');
        setVoucherCode(orderToEdit.voucherCode || '');
        setAmountTendered(orderToEdit.amountTendered?.toString() || '');
        setOrderType(orderToEdit.orderType || 'dine-in');
      }
    }
  }, [searchParams, isLoaded, settings.orders]);


  useEffect(() => {
    const loyalCustomer = customers.find(c => c.mobile === customerMobile);
    if (loyalCustomer) {
        setCustomerName(loyalCustomer.name);
    }
  }, [customerMobile, customers]);

  const resetOrderState = () => {
    setCurrentOrderItems([]);
    setCustomerName('');
    setCustomerMobile('');
    setVoucherCode('');
    setManualDiscountValue('');
    setAmountTendered('');
    setOrderType('dine-in');
    setAppliedDiscount(null);
    setLastOrder(null);
    setEditingOrder(null);
    router.push('/admin/modules/pos/orderEntry');
  }

  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) {
        console.error("Print content ref is not available.");
        return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Could not open print window. Please disable your popup blocker.');
        return;
    }

    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

    const contentHTML = contentRef.current.innerHTML;

    const html = `
        <html>
            <head>
                <title>${title}</title>
                ${styleTags}
                <style>
                    @media print {
                        body {
                            margin: 0;
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="p-4">
                    ${contentHTML}
                </div>
            </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        // printWindow.close();
    }, 500);
  };
  
  const calculateInitialUnitPrice = (basePrice: number, variant?: MenuItemVariant, addOns?: MenuItemAddOn[]) => {
    const variantPrice = variant ? variant.price : basePrice;
    const addOnsPrice = (addOns || []).reduce((total, addon) => total + addon.price, 0);
    return variantPrice + addOnsPrice;
  }

  const addToCart = (itemData: Omit<OrderItem, 'id' | 'subtotal'>) => {
    const existingItemIndex = currentOrderItems.findIndex(i => 
      i.itemId === itemData.itemId && 
      i.variant?.id === itemData.variant?.id &&
      JSON.stringify((i.addons || []).map(a => a.id).sort()) === JSON.stringify((itemData.addons || []).map(a => a.id).sort()) &&
      i.unitPrice === itemData.unitPrice
    );

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
      setCurrentOrderItems(prevItems => [...prevItems, { ...itemData, id: uuidv4(), subtotal: itemData.unitPrice * itemData.quantity }]);
    }
  };

  const handleItemClick = (item: MenuItem, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnimatingItem({
        src: item.image,
        x: rect.left,
        y: rect.top
    });

    if (posSettings.advancedItemOptions && ((item.variants?.length || 0) > 0 || (item.addOns?.length || 0) > 0)) {
      setSelectedItem(item);
      setSelectedVariant(item.variants?.length > 0 ? item.variants[0] : undefined);
      setSelectedAddOns([]);
      setItemOptionsDialogOpen(true);
    } else {
      addToCart({
        itemId: item.id,
        name: item.name,
        description: item.description,
        basePrice: item.price,
        unitPrice: item.price,
        quantity: 1,
        addons: [],
      });
    }
  };

  const handleItemOptionsDialogSubmit = () => {
    if (!selectedItem) return;

    const unitPrice = calculateInitialUnitPrice(selectedItem.price, selectedVariant, selectedAddOns);

    addToCart({
        itemId: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        basePrice: selectedItem.price,
        unitPrice: unitPrice,
        quantity: 1,
        variant: selectedVariant,
        addons: selectedAddOns,
    });

    setItemOptionsDialogOpen(false);
    setSelectedItem(null);
  };
  
  const updateOrderItemQuantity = (itemId: string, newQuantityOrDelta: number | string) => {
    setCurrentOrderItems(prevItems => {
        const itemIndex = prevItems.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return prevItems;

        const updatedItems = [...prevItems];
        const item = updatedItems[itemIndex];
        
        let newQuantity: number;
        if (typeof newQuantityOrDelta === 'string') {
            newQuantity = parseInt(newQuantityOrDelta, 10);
            if (isNaN(newQuantity)) return updatedItems; // Do nothing if input is not a number
        } else {
            newQuantity = item.quantity + newQuantityOrDelta;
        }

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

  const handlePriceUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPriceItem) return;

    const formData = new FormData(e.currentTarget);
    const newPriceValue = formData.get('unitPrice') as string;
    const newUnitPrice = parseFloat(newPriceValue);

    if (isNaN(newUnitPrice) || newUnitPrice < 0) return;

      setCurrentOrderItems(prev => prev.map(item => {
          if (item.id === editingPriceItem.id) {
              return {
                  ...item,
                  unitPrice: newUnitPrice,
                  subtotal: newUnitPrice * item.quantity,
              }
          }
          return item;
      }));
      setEditingPriceItem(null);
      setPriceEditDialogOpen(false);
  }

  const { subtotal, discount, total, changeDue } = useMemo(() => {
    const currentSubtotal = currentOrderItems.reduce((total, item) => total + item.subtotal, 0);
    let discountAmount = 0;
    let discountInfo: AppliedDiscount | null = null;
    const manualDiscountInput = parseFloat(manualDiscountValue);

    if (!isNaN(manualDiscountInput) && manualDiscountInput > 0) {
        if (manualDiscountType === 'fixed') {
            discountAmount = (posSettings.maxDiscountAmount > 0 && manualDiscountInput > posSettings.maxDiscountAmount) ? posSettings.maxDiscountAmount : manualDiscountInput;
        } else {
            let pctDiscount = (currentSubtotal * manualDiscountInput) / 100;
            if (posSettings.maxDiscountPercentage > 0 && manualDiscountInput > posSettings.maxDiscountPercentage) {
                pctDiscount = (currentSubtotal * posSettings.maxDiscountPercentage) / 100;
            }
            if (posSettings.maxDiscountAmount > 0 && pctDiscount > posSettings.maxDiscountAmount) {
                pctDiscount = posSettings.maxDiscountAmount;
            }
            discountAmount = pctDiscount;
        }
        discountInfo = { type: 'manual', description: `Manual: ${manualDiscountType === 'fixed' ? '৳' : ''}${manualDiscountValue}${manualDiscountType === 'percentage' ? '%' : ''}`};
    } 
    else if (voucherCode) {
        let appliedVoucher = vouchers.find(v => v.code.toLowerCase() === voucherCode.toLowerCase() && v.isActive) || null;
        if (appliedVoucher) {
            const now = new Date();
            const startDate = appliedVoucher.startDate ? new Date(appliedVoucher.startDate) : null;
            const endDate = appliedVoucher.endDate ? new Date(appliedVoucher.endDate) : null;
            if ((startDate && now < startDate) || (endDate && now > endDate) || (appliedVoucher.minOrderValue && currentSubtotal < appliedVoucher.minOrderValue)) {
                appliedVoucher = null;
            }
            if (appliedVoucher) {
                 if (appliedVoucher.type === 'fixed') {
                    discountAmount = appliedVoucher.value;
                } else {
                    let pctDiscount = (currentSubtotal * appliedVoucher.value) / 100;
                    if(appliedVoucher.maxDiscountAmount && pctDiscount > appliedVoucher.maxDiscountAmount){
                        pctDiscount = appliedVoucher.maxDiscountAmount;
                    }
                    discountAmount = pctDiscount;
                }
                discountInfo = { type: 'voucher', description: `Voucher: ${appliedVoucher.code}`};
            }
        }
    }
    else if (customerMobile) {
        const loyalCustomer = customers.find(c => c.mobile === customerMobile) || null;
        if (loyalCustomer && loyalCustomer.discountType && loyalCustomer.discountValue) {
            const now = new Date();
            const validityDate = loyalCustomer.discountValidity ? new Date(loyalCustomer.discountValidity) : null;
            if (!validityDate || now < validityDate) {
                if (loyalCustomer.discountType === 'fixed') {
                    discountAmount = loyalCustomer.discountValue;
                } else {
                    discountAmount = (currentSubtotal * loyalCustomer.discountValue) / 100;
                }
                 discountInfo = { type: 'loyal', description: `Loyalty: ${loyalCustomer.discountType === 'fixed' ? '৳' : ''}${loyalCustomer.discountValue}${loyalCustomer.discountType === 'percentage' ? '%' : ''}`};
            }
        }
    }
    
    setAppliedDiscount(discountInfo);
    const currentTotal = Math.max(0, currentSubtotal - discountAmount);
    const tendered = parseFloat(amountTendered);
    const currentChangeDue = !isNaN(tendered) && tendered >= currentTotal ? tendered - currentTotal : 0;

    return { 
        subtotal: currentSubtotal, 
        discount: { amount: discountAmount, type: discountInfo?.type, code: voucherCode }, 
        total: currentTotal,
        changeDue: currentChangeDue
    };
  }, [currentOrderItems, manualDiscountValue, manualDiscountType, voucherCode, customerMobile, amountTendered, vouchers, customers, posSettings]);

  const handleClearDiscount = () => {
    setManualDiscountValue('');
    setVoucherCode('');
  }

  const handleFinalizeOrder = (options: { printAction: 'none' | 'customer' | 'kitchen' }) => {
    if (currentOrderItems.length === 0) {
        alert('Cannot place an empty order.');
        return;
    }

    if (editingOrder) {
        const updatedOrderData: Order = {
            ...editingOrder,
            items: currentOrderItems,
            customerId: customers.find(c => c.mobile === customerMobile)?.id,
            customerName: customerName || 'Guest',
            customerMobile: customerMobile || undefined,
            subtotal: subtotal,
            voucherCode: discount.type === 'voucher' ? discount.code : undefined,
            discountAmount: discount.amount,
            discountType: discount.type,
            orderType: orderType,
            total: total,
            amountTendered: parseFloat(amountTendered) || undefined,
            changeDue: changeDue > 0 ? changeDue : undefined,
        };
        updateOrder(updatedOrderData);
        alert(`Order #${updatedOrderData.orderNumber} updated successfully!`);
        router.push('/admin/modules/pos/orderHistory');

    } else {
        const orderData: Omit<Order, 'id' | 'orderNumber'> = {
            items: currentOrderItems,
            customerId: customers.find(c => c.mobile === customerMobile)?.id,
            customerName: customerName || 'Guest',
            customerMobile: customerMobile || undefined,
            status: 'completed',
            paymentStatus: 'paid',
            orderType: orderType,
            subtotal: subtotal,
            voucherCode: discount.type === 'voucher' ? discount.code : undefined,
            discountAmount: discount.amount,
            discountType: discount.type,
            total: total,
            amountTendered: parseFloat(amountTendered) || undefined,
            changeDue: changeDue > 0 ? changeDue : undefined,
            createdAt: new Date().toISOString(),
        };
        
        const newOrder = addOrder(orderData);
        setLastOrder(newOrder);

        setTimeout(() => {
            if (options.printAction === 'customer') {
                printInNewWindow(receiptRef, `Receipt #${newOrder.orderNumber}`);
            } else if (options.printAction === 'kitchen') {
                printInNewWindow(kitchenTicketRef, `Kitchen Ticket #${newOrder.orderNumber}`);
            }
            resetOrderState();
        }, 100);
    }
  }
  
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return menuItems;
    return menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [menuItems, searchQuery]);

  if (!isLoaded) return <div>Loading...</div>;

  const MenuItemCard = ({item, onClick}: {item: MenuItem, onClick: (e: React.MouseEvent<HTMLDivElement>) => void}) => (
     <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
        <CardHeader className="p-0">
          <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded-t-lg" data-ai-hint="food dish" />
        </CardHeader>
        <CardContent className="p-3 flex-grow flex flex-col justify-between">
            <h3 className="font-semibold text-sm">{item.name}</h3>
            <p className="text-xs text-muted-foreground">৳{item.price.toFixed(2)}</p>
        </CardContent>
      </Card>
  );

  return (
    <>
      <AnimatePresence>
        {animatingItem && cartPanelRef.current && (
          <motion.img
            src={animatingItem.src}
            initial={{ 
              x: animatingItem.x, 
              y: animatingItem.y, 
              width: '100px', 
              height: '75px', 
              opacity: 0.8, 
              position: 'fixed', 
              zIndex: 100, 
              borderRadius: '0.5rem' 
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

      <div className="print:hidden">
        <div style={{ display: 'none' }}>
            {lastOrder && (
                <>
                    <div ref={receiptRef}>
                        <CustomerReceipt order={lastOrder} organization={organization} />
                    </div>
                    <div ref={kitchenTicketRef}>
                        <KitchenTicket order={lastOrder} organization={organization} />
                    </div>
                </>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
         <div className="p-1 mb-2">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input ref={searchInputRef} placeholder="Search menu items... (Alt+N)" className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
         </div>
         {posSettings.showItemsByCategory ? (
            <Tabs defaultValue={menuCategories[0]?.id || ''} className="flex-grow flex flex-col overflow-hidden">
                <TabsList className="flex-shrink-0 overflow-x-auto">
                {menuCategories.map(category => (
                    <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
                ))}
                </TabsList>
                {menuCategories.map(category => (
                <TabsContent key={category.id} value={category.id} className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
                    {filteredMenuItems.filter(item => item.categoryId === category.id).map(item => (
                       <MenuItemCard key={item.id} item={item} onClick={(e) => handleItemClick(item, e)} />
                    ))}
                    </div>
                </TabsContent>
                ))}
            </Tabs>
         ) : (
            <Card className="flex-grow overflow-y-auto">
                <CardContent className="p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
                        {filteredMenuItems.map(item => (
                             <MenuItemCard key={item.id} item={item} onClick={(e) => handleItemClick(item, e)} />
                        ))}
                    </div>
                </CardContent>
            </Card>
         )}
        </div>

        <div ref={cartPanelRef} className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">{editingOrder ? `Editing Order #${editingOrder.orderNumber}` : 'Current Order'}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {currentOrderItems.length > 0 ? (
                  currentOrderItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-sm p-1 rounded-md hover:bg-muted/50">
                        <span className="flex-grow font-semibold truncate" title={item.name}>{item.name}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateOrderItemQuantity(item.id, -1)}><Minus className="h-3 w-3"/></Button>
                            <Input
                                type="text"
                                className="h-6 w-10 text-center text-sm p-1"
                                value={item.quantity}
                                onChange={(e) => posSettings.allowQuantityEdit && updateOrderItemQuantity(item.id, e.target.value)}
                                readOnly={!posSettings.allowQuantityEdit}
                            />
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateOrderItemQuantity(item.id, 1)}><Plus className="h-3 w-3"/></Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-20 text-right font-medium">৳{item.subtotal.toFixed(2)}</span>
                           {posSettings.allowPriceEdit && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { setEditingPriceItem(item); setPriceEditDialogOpen(true); }}>
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 text-destructive" onClick={() => updateOrderItemQuantity(item.id, -item.quantity)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-10">Select items from the menu.</p>
                )}
              </div>
            
              <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                      <Input ref={customerMobileInputRef} placeholder="Customer mobile (Alt+M)" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} className="h-8"/>
                      <Input ref={customerNameInputRef} placeholder="Guest (Alt+N)" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-8"/>
                  </div>
                  <div className="flex gap-2 items-center">
                      <Input ref={voucherCodeInputRef} placeholder="Voucher Code (Alt+V)" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} className="h-8 flex-grow"/>
                      <Button variant="ghost" size="icon" onClick={handleClearDiscount} className="h-8 w-8 flex-shrink-0"><XCircle className="w-5 h-5 text-destructive" /></Button>
                  </div>
                  <div className="flex gap-2 items-center">
                      <Input ref={manualDiscountInputRef} placeholder="Manual Discount (Alt+D)" type="number" value={manualDiscountValue} onChange={e => setManualDiscountValue(e.target.value)} className="h-8 flex-grow"/>
                      <Select value={manualDiscountType} onValueChange={(v) => setManualDiscountType(v as any)}>
                          <SelectTrigger className="w-[120px] h-8 flex-shrink-0"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="fixed">Fixed (৳)</SelectItem>
                              <SelectItem value="percentage">Percent (%)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  {posSettings.enableOrderTypes && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                          {(['dine-in', 'takeaway', 'delivery'] as const).map(type => (
                              <Button 
                                  key={type}
                                  type="button"
                                  variant={orderType === type ? 'default': 'outline'}
                                  onClick={() => setOrderType(type)}
                                  className="flex-1 h-8"
                              >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                              </Button>
                          ))}
                      </div>
                  )}
              </div>

              <div className="p-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm"><p>Subtotal</p> <p>৳{subtotal.toFixed(2)}</p></div>
                  <div className="flex justify-between text-sm text-destructive">
                      <p>Discount {appliedDiscount && <span className="text-xs">({appliedDiscount.description})</span>}</p> 
                      <p>-৳{discount.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-bold text-lg"><p>Total</p> <p>৳{total.toFixed(2)}</p></div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                          <Label>Amount Tendered (Alt+T)</Label>
                          <Input ref={amountTenderedInputRef} placeholder="0.00" type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} />
                      </div>
                      <div className="text-right">
                          <p className="text-sm text-muted-foreground">Change Due</p>
                          <p className="text-2xl font-bold">৳{changeDue.toFixed(2)}</p>
                      </div>
                  </div>
              </div>
              <div className="p-4 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <Button ref={saveButtonRef} variant="outline" onClick={() => handleFinalizeOrder({printAction: 'none'})}>{editingOrder ? 'Update Order' : 'Save (Alt+S)'}</Button>
                  <Button ref={clearButtonRef} variant="destructive" onClick={resetOrderState}>Clear (Alt+C)</Button>
                  
                  { !editingOrder && (
                    <div className="col-span-2 grid grid-cols-1 gap-2">
                        <Button ref={printCustomerButtonRef} variant="secondary" onClick={() => handleFinalizeOrder({printAction: 'customer'})}>Print Cust. Copy (Alt+Z)</Button>
                        {posSettings.showPrintWithKitchenButton && (
                            <Button ref={printKitchenButtonRef} onClick={() => handleFinalizeOrder({printAction: 'kitchen'})} className="w-full">Print with Kitchen copy (Alt+X)</Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={itemOptionsDialogOpen} onOpenChange={setItemOptionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>Customize your item.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem?.variants && selectedItem.variants.length > 0 && (
                <div>
                    <Label>Variants</Label>
                     <div className="space-y-2 rounded-md border p-2">
                        {selectedItem.variants.map(variant => (
                          <div 
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                              selectedVariant?.id === variant.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                            )}
                          >
                            <span>{variant.name} - ৳{variant.price.toFixed(2)}</span>
                            {selectedVariant?.id === variant.id && <Check className="h-4 w-4" />}
                          </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedItem?.addOns && selectedItem.addOns.length > 0 && (
                <div>
                    <Label>Add-ons</Label>
                    <div className="space-y-2 rounded-md border p-2 max-h-48 overflow-y-auto">
                        {selectedItem.addOns.map(addon => (
                            <div key={addon.id} className="flex items-center justify-between">
                                <Label htmlFor={`addon-${addon.id}`} className="font-normal flex-grow">{addon.name} (+৳{addon.price.toFixed(2)})</Label>
                                <Input 
                                    type="checkbox" 
                                    id={`addon-${addon.id}`}
                                    className="h-4 w-4 shrink-0"
                                    checked={selectedAddOns.some(a => a.id === addon.id)}
                                    onChange={(e) => {
                                        if(e.target.checked) {
                                            setSelectedAddOns(prev => [...prev, addon])
                                        } else {
                                            setSelectedAddOns(prev => prev.filter(a => a.id !== addon.id))
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleItemOptionsDialogSubmit}>Add to Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={priceEditDialogOpen} onOpenChange={setPriceEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Price for {editingPriceItem?.name}</DialogTitle>
                <DialogDescription>Enter the new unit price for this item.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePriceUpdate}>
                <div className="py-4">
                    <Label htmlFor="unitPrice">New Unit Price</Label>
                    <Input id="unitPrice" name="unitPrice" type="number" step="0.01" defaultValue={editingPriceItem?.unitPrice} required autoFocus/>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPriceEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Price</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
