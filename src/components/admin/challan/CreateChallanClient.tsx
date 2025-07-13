
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, Printer, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Customer, Product, Challan } from '@/types';
import { ChallanPrint } from './print/ChallanPrint';
import { v4 as uuidv4 } from 'uuid';

type NewChallanItem = {
  tempId: string;
  productId: string;
  name: string;
  serialNumber: string;
  price: number;
}

export function CreateChallanClient() {
  const { settings, addChallan, addCustomer, isLoaded } = useSettings();
  const { customers, products, organization } = settings;
  const router = useRouter();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  
  // Product Addition State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [autoGenerateSerials, setAutoGenerateSerials] = useState(false);
  
  const [challanItems, setChallanItems] = useState<NewChallanItem[]>([]);
  
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [challanToPrint, setChallanToPrint] = useState<Challan | null>(null);
  
  const prevCustomerCountRef = useRef(customers.length);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customers.length > prevCustomerCountRef.current) {
        const newCustomer = customers[customers.length - 1];
        if (newCustomer) setSelectedCustomerId(newCustomer.id);
    }
    prevCustomerCountRef.current = customers.length;
  }, [customers]);

  useEffect(() => {
    if (challanToPrint && printRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(printRef, `Challan - ${challanToPrint.challanNumber}`);
        setChallanToPrint(null);
        router.push('/admin/modules/challanAndBilling');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [challanToPrint, router]);
  
  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Could not open print window. Please disable your popup blocker.');
      return;
    }
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('\n');
    printWindow.document.write(`<html><head><title>${title}</title>${styleTags}</head><body>${contentRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };
  
  const handleAddCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData: Omit<Customer, 'id'> = { name: formData.get('name') as string, mobile: formData.get('mobile') as string, email: formData.get('email') as string, address: formData.get('address') as string };
    if (!customerData.name || !customerData.mobile) return;
    addCustomer(customerData);
    setCustomerDialogOpen(false);
  };

  const handleAddItems = () => {
    const product = products.find(p => p.id === selectedProductId);
    const qty = parseInt(quantity, 10);
    if (!product || isNaN(qty) || qty <= 0) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }

    const newItems: NewChallanItem[] = [];
    for (let i = 0; i < qty; i++) {
      newItems.push({
        tempId: uuidv4(),
        productId: product.id,
        name: product.name,
        serialNumber: autoGenerateSerials ? `${product.name.slice(0, 4).toUpperCase()}-${uuidv4().slice(0, 8).toUpperCase()}` : '',
        price: product.price,
      });
    }

    setChallanItems(prev => [...prev, ...newItems]);
    // Reset selection
    setSelectedProductId('');
    setQuantity('1');
    setAutoGenerateSerials(false);
  };

  const handleSerialChange = (tempId: string, newSerial: string) => {
      setChallanItems(prev => prev.map(item => item.tempId === tempId ? { ...item, serialNumber: newSerial } : item));
  }
  
  const handleRemoveItem = (tempId: string) => {
    setChallanItems(prev => prev.filter(item => item.tempId !== tempId));
  };
  
  const handleSaveAndPrint = () => {
    if (!selectedCustomerId || challanItems.length === 0) {
      alert("Please select a customer and add at least one item.");
      return;
    }
    if (challanItems.some(item => !item.serialNumber.trim())) {
      alert("Please ensure all items have a serial number before saving.");
      return;
    }

    const itemsForContext = challanItems.map(({ tempId, ...rest }) => rest);
    const newChallan = addChallan({ 
        customerId: selectedCustomerId, 
        createdAt: new Date().toISOString(), 
        items: itemsForContext, 
        deliveryLocation 
    });
    setChallanToPrint(newChallan);
  };

  const availableProducts = useMemo(() => {
    const addedProductIds = new Set(challanItems.map(item => item.productId));
    return products.filter(p => !addedProductIds.has(p.id));
  }, [products, challanItems]);


  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <div className="hidden">
        {challanToPrint && (
          <div ref={printRef}>
            <ChallanPrint challan={challanToPrint} customer={customers.find(c => c.id === challanToPrint.customerId)!} organization={organization} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Customer & Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="customerId">Select Customer</Label>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId} required>
                            <SelectTrigger><SelectValue placeholder="Search or select a customer..." /></SelectTrigger>
                            <SelectContent>
                                {customers.map(customer => <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.mobile}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setCustomerDialogOpen(true)}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="deliveryLocation">Delivery Location</Label>
                    <Input id="deliveryLocation" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="e.g., Office, Home..." />
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {availableProducts.map(product => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
                </div>
                <div className="flex items-end pb-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="auto-generate" checked={autoGenerateSerials} onCheckedChange={checked => setAutoGenerateSerials(!!checked)} />
                        <Label htmlFor="auto-generate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Auto-generate serials
                        </Label>
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleAddItems} disabled={!selectedProductId}>Add to Challan</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Challan Items ({challanItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challanItems.length > 0 ? challanItems.map(item => (
                  <TableRow key={item.tempId}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                        <Input 
                            value={item.serialNumber} 
                            onChange={e => handleSerialChange(item.tempId, e.target.value)} 
                            className="h-8 font-mono text-xs"
                            placeholder="Enter serial number"
                        />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.tempId)}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center">No items added to challan.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="button" onClick={handleSaveAndPrint}>
              <Printer className="mr-2 h-4 w-4" /> Save & Print Challan
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Add New Customer</DialogTitle><DialogDescription>Enter the details for the new customer.</DialogDescription></DialogHeader>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
                <div className="space-y-2"><Label htmlFor="mobile">Mobile Number</Label><Input id="mobile" name="mobile" required /></div>
                <div className="space-y-2"><Label htmlFor="email">Email (Optional)</Label><Input id="email" name="email" type="email" /></div>
                <div className="space-y-2"><Label htmlFor="address">Address (Optional)</Label><Input id="address" name="address" /></div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setCustomerDialogOpen(false)}>Cancel</Button><Button type="submit">Create Customer</Button></DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
