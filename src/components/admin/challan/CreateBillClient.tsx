
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Challan, ChallanItem, Customer, Order, OrderItem, OrganizationInfo } from '@/types';
import { BillPrint } from './print/BillPrint';
import { Printer } from 'lucide-react';

interface CreateBillClientProps {
  challanId: string;
}

export function CreateBillClient({ challanId }: CreateBillClientProps) {
  const { settings, addOrder, isLoaded } = useSettings();
  const { challans, customers, inventoryItems, organization, products } = settings;
  const router = useRouter();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [billItems, setBillItems] = useState<ChallanItem[]>([]);
  
  const [manualDiscountType, setManualDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [amountTendered, setAmountTendered] = useState('');
  
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const availableForBilling = useMemo(() => {
    if (!challan) return [];
    return challan.items.filter(ci => inventoryItems.find(inv => inv.id === ci.inventoryItemId)?.status === 'allocated-to-challan');
  }, [challan, inventoryItems]);

  useEffect(() => {
    if (isLoaded) {
      const foundChallan = challans.find(c => c.id === challanId);
      if (foundChallan) {
        setChallan(foundChallan);
        setCustomer(customers.find(c => c.id === foundChallan.customerId) || null);
      } else {
        alert("Challan not found!");
        router.push('/admin/modules/challanAndBilling');
      }
    }
  }, [challanId, isLoaded, challans, customers, router]);

  useEffect(() => {
    if (orderToPrint && printRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(printRef, `Bill - ${orderToPrint.orderNumber}`);
        setOrderToPrint(null);
        router.push('/admin/modules/challanAndBilling');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint, router]);

  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Could not open print window. Please disable your popup blocker.');
      return;
    }
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('\n');
    printWindow.document.write(`<html><head><title>${title}</title>${styleTags}</head><body><div class="p-4">${contentRef.current.innerHTML}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };
  
  const handleItemToggle = (item: ChallanItem, checked: boolean) => {
    setBillItems(prev => checked ? [...prev, item] : prev.filter(bi => bi.inventoryItemId !== item.inventoryItemId));
  };
  
  const handleSelectAll = () => setBillItems(availableForBilling);
  
  const handleSelectByProduct = (productId: string) => {
    const productItems = availableForBilling.filter(item => item.productId === productId);
    const newItems = productItems.filter(pi => !billItems.some(bi => bi.inventoryItemId === pi.inventoryItemId));
    setBillItems(prev => [...prev, ...newItems]);
  };
  
  const { subtotal, discount, total } = useMemo(() => {
    const currentSubtotal = billItems.reduce((acc, item) => acc + item.price, 0);
    let discountAmount = 0;
    const manualDiscountInput = parseFloat(manualDiscountValue);
    if (!isNaN(manualDiscountInput) && manualDiscountInput > 0) {
      discountAmount = manualDiscountType === 'fixed' ? manualDiscountInput : (currentSubtotal * manualDiscountInput) / 100;
    }
    const currentTotal = Math.max(0, currentSubtotal - discountAmount);
    return { subtotal: currentSubtotal, discount: discountAmount, total: currentTotal };
  }, [billItems, manualDiscountValue, manualDiscountType]);
  
  const handleFinalizeBill = () => {
    if (!challan || !customer || billItems.length === 0) {
      alert("Cannot create an empty bill.");
      return;
    }
    
    const orderItems: OrderItem[] = billItems.map(item => ({
      id: item.inventoryItemId,
      itemId: item.productId,
      name: item.name,
      serialNumber: item.serialNumber,
      description: `Serial: ${item.serialNumber}`,
      basePrice: item.price,
      unitPrice: item.price,
      quantity: 1,
      subtotal: item.price
    }));

    const orderData: Omit<Order, 'id' | 'orderNumber'> = {
      items: orderItems,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      status: 'completed',
      paymentStatus: 'pending',
      orderType: 'delivery',
      subtotal: subtotal,
      discountAmount: discount,
      discountType: discount > 0 ? 'manual' : undefined,
      total: total,
      amountTendered: parseFloat(amountTendered) || undefined,
      changeDue: (parseFloat(amountTendered) || 0) > total ? (parseFloat(amountTendered) || 0) - total : undefined,
      createdAt: new Date().toISOString(),
      challanId: challan.id,
    };
    
    const newOrder = addOrder(orderData, billItems.map(bi => bi.inventoryItemId));
    setOrderToPrint(newOrder);
  };
  
  const productsOnChallan = useMemo(() => {
      const productMap = new Map<string, { product: Product, items: ChallanItem[] }>();
      availableForBilling.forEach(item => {
          if (!productMap.has(item.productId)) {
              const product = products.find(p => p.id === item.productId);
              if (product) productMap.set(item.productId, { product, items: [] });
          }
          productMap.get(item.productId)?.items.push(item);
      });
      return Array.from(productMap.values());
  }, [availableForBilling, products]);

  if (!isLoaded || !challan || !customer) return <div>Loading...</div>;

  return (
    <>
       <div className="hidden">
        {orderToPrint && challan && (
          <div ref={printRef}>
            <BillPrint order={orderToPrint} challan={challan} customer={customer} organization={organization} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Challan Details (No: {challan.challanNumber})</CardTitle>
              <CardDescription>Select items to include in this bill. Items already billed will not appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={handleSelectAll}>Select All Unbilled Items</Button>
              </div>
              <div className="space-y-4">
                {productsOnChallan.map(({ product, items }) => (
                  <Card key={product.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Button size="sm" variant="outline" onClick={() => handleSelectByProduct(product.id)}>
                        Select All from this Product
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Bill</TableHead>
                            <TableHead>Serial Number</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map(item => (
                            <TableRow key={item.inventoryItemId}>
                              <TableCell>
                                <Checkbox
                                  checked={billItems.some(bi => bi.inventoryItemId === item.inventoryItemId)}
                                  onCheckedChange={(checked) => handleItemToggle(item, !!checked)}
                                />
                              </TableCell>
                              <TableCell>{item.serialNumber}</TableCell>
                              <TableCell className="text-right">৳{item.price.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="sticky top-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm"><p>Subtotal ({billItems.length} items)</p> <p>৳{subtotal.toFixed(2)}</p></div>
                  <div className="flex justify-between text-sm text-destructive"><p>Discount</p><p>-৳{discount.toFixed(2)}</p></div>
                  <div className="flex justify-between font-bold text-lg"><p>GRAND TOTAL</p><p>৳{total.toFixed(2)}</p></div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                  <Label>Discount</Label>
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
              
               <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="amountTendered">Amount Paid Now</Label>
                  <Input id="amountTendered" placeholder="0.00" type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} />
               </div>

                <div className="border-t pt-4">
                  <p className="text-lg font-bold text-destructive">Amount Due: ৳{(total - (parseFloat(amountTendered) || 0)).toFixed(2)}</p>
                </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleFinalizeBill}>
                <Printer className="mr-2 h-4 w-4" /> Finalize & Print Bill
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
