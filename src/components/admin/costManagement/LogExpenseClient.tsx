
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, XCircle, Plus, ScanLine, Loader2 } from 'lucide-react';
import type { RawMaterial, BillItem, Supplier } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Tesseract from 'tesseract.js';

// Helper function to find the best match for a supplier name from OCR text
function findBestSupplierMatch(text: string, suppliers: Supplier[]): string | undefined {
    if (!text || suppliers.length === 0) {
        return undefined;
    }

    let bestMatch: Supplier | undefined = undefined;
    let highestScore = 0;
    const textLower = text.toLowerCase();

    for (const supplier of suppliers) {
        const supplierNameLower = supplier.name.toLowerCase();
        let score = 0;
        
        // Simple scoring mechanism: count how many words from the supplier name appear in the text
        const supplierWords = supplierNameLower.split(/\s+/);
        for(const word of supplierWords) {
            if(textLower.includes(word)) {
                score += word.length;
            }
        }
        
        if (score > highestScore) {
            highestScore = score;
            bestMatch = supplier;
        }
    }

    return bestMatch?.id;
}


export function LogExpenseClient() {
  const { settings, addSupplierBill, addSupplier, addRawMaterial, isLoaded } = useSettings();
  const { suppliers, rawMaterials, expenseCategories } = settings;

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [billNumber, setBillNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidAmount, setPaidAmount] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const prevSupplierCountRef = useRef(suppliers.length);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (suppliers.length > prevSupplierCountRef.current) {
        const newSupplier = suppliers[suppliers.length - 1];
        if (newSupplier) setSelectedSupplierId(newSupplier.id);
    }
    prevSupplierCountRef.current = suppliers.length;
  }, [suppliers]);


  const totalAmount = useMemo(() => {
    return billItems.reduce((acc, item) => acc + item.quantity * item.cost, 0);
  }, [billItems]);

  const handleAddItem = (material: RawMaterial) => {
    setPopoverOpen(false);
    const newItem: BillItem = {
      id: uuidv4(),
      rawMaterialId: material.id,
      name: material.name,
      unit: material.unit,
      quantity: 1,
      cost: 0,
    };
    setBillItems(prev => [...prev, newItem]);
  };

  const handleItemChange = (id: string, field: 'quantity' | 'cost', value: number) => {
    setBillItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleAddSupplierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supplierData: Omit<Supplier, 'id'> = { name: formData.get('name') as string, mobile: formData.get('mobile') as string, email: formData.get('email') as string, address: formData.get('address') as string };
    if (!supplierData.name || !supplierData.mobile) return;
    addSupplier(supplierData);
    setSupplierDialogOpen(false);
  };

  const handleMaterialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;
    const categoryId = formData.get('categoryId') as string;

    if (!name || !unit || !categoryId) return;
    addRawMaterial({ name, unit, categoryId });
    setMaterialDialogOpen(false);
  }
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        
        // Find Supplier
        const matchedSupplierId = findBestSupplierMatch(text, suppliers);
        if(matchedSupplierId) {
            setSelectedSupplierId(matchedSupplierId);
        }

        // Find Bill Number (Invoice No, Bill No, etc.)
        const billNumberMatch = text.match(/(?:invoice|bill)\s*#?[:\s]?\s*(\w+)/i);
        if (billNumberMatch && billNumberMatch[1]) {
            setBillNumber(billNumberMatch[1]);
        }

        // Find Date (various formats)
        const dateMatch = text.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
        if (dateMatch && dateMatch[1]) {
            try {
              // Attempt to parse the date, might need a more robust library for complex cases
              const parsedDate = new Date(dateMatch[1].replace(/[-/]/g, '/'));
              if (!isNaN(parsedDate.getTime())) {
                setExpenseDate(parsedDate.toISOString().split('T')[0]);
              }
            } catch(e) { console.error("Date parsing failed", e)}
        }

        // Find Total Amount
        const totalMatch = text.match(/(?:total|amount|grand total)[:\s]?\s*[\$৳]?\s*(\d+\.\d{2})/i);
        if (totalMatch && totalMatch[1]) {
            setPaidAmount(totalMatch[1]);
        }
        
    } catch (error) {
        console.error('Tesseract OCR failed:', error);
        setScanError('Failed to extract information from the bill. Please try again or enter details manually.');
    } finally {
        setIsScanning(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      alert("Please select a supplier.");
      return;
    }

    if (billItems.length === 0) {
      alert("Please add at least one item to the bill.");
      return;
    }

    if (billItems.some(item => item.quantity <= 0 || item.cost < 0)) {
      alert("Please ensure all items have a valid quantity and non-negative cost.");
      return;
    }

    addSupplierBill({
      supplierId: selectedSupplierId,
      items: billItems,
      totalAmount: totalAmount,
      paidAmount: parseFloat(paidAmount) || 0,
      date: expenseDate,
      billNumber: billNumber || undefined,
      notes: notes || undefined,
    });
    
    alert('Bill recorded successfully!');
    
    // Reset form
    setSelectedSupplierId('');
    setBillNumber('');
    setNotes('');
    setPaidAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setBillItems([]);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  const availableMaterials = rawMaterials.filter(mat => !billItems.some(item => item.rawMaterialId === mat.id));
  const dueAmount = totalAmount - (parseFloat(paidAmount) || 0);

  return (
    <>
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Record Supplier Bill</CardTitle>
              <CardDescription>
                Enter the details of a bill received from a supplier.
              </CardDescription>
            </div>
             <div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*"/>
                <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isScanning}>
                    {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                    {isScanning ? 'Scanning...' : 'Scan a Bill'}
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {scanError && (
              <Alert variant="destructive">
                  <AlertTitle>Scan Error</AlertTitle>
                  <AlertDescription>{scanError}</AlertDescription>
              </Alert>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier</Label>
               <div className="flex items-center gap-2">
                <Select name="supplierId" value={selectedSupplierId} onValueChange={setSelectedSupplierId} required>
                  <SelectTrigger><SelectValue placeholder="Select a supplier..."/></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setSupplierDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                </Button>
               </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billNumber">Bill / Invoice Number</Label>
              <Input id="billNumber" name="billNumber" placeholder="e.g., INV-12345" value={billNumber} onChange={e => setBillNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" name="expenseDate" type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required/>
            </div>
          </div>
          
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Bill Items</CardTitle>
                     <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" role="combobox" className="w-[250px] justify-between">
                                Add Material
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                            <Command>
                                <div className="flex items-center border-b px-3">
                                    <CommandInput placeholder="Search material..." className="flex-1 h-10 border-0 outline-none ring-0 focus-visible:ring-0"/>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setMaterialDialogOpen(true); setPopoverOpen(false); }}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CommandList>
                                <CommandEmpty>No material found.</CommandEmpty>
                                <CommandGroup>
                                    {availableMaterials.map((material) => (
                                    <CommandItem
                                        key={material.id}
                                        value={material.name}
                                        onSelect={() => handleAddItem(material)}
                                    >
                                        {material.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead className="w-[120px]">Quantity</TableHead>
                            <TableHead className="w-[120px]">Cost/Unit</TableHead>
                            <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {billItems.length > 0 ? billItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name} <span className="text-xs text-muted-foreground">({item.unit})</span></TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                                        className="h-8"
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        value={item.cost}
                                        onChange={e => handleItemChange(item.id, 'cost', parseFloat(e.target.value))}
                                        className="h-8"
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell className="text-right font-medium">৳{(item.quantity * item.cost).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="h-8 w-8">
                                        <XCircle className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No items added to this bill.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="e.g., Purchase of raw materials for weekly stock" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
             <div className="space-y-4 rounded-lg border p-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base">Total Amount</Label>
                    <p className="text-2xl font-bold">৳{totalAmount.toFixed(2)}</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount</Label>
                    <Input id="paidAmount" name="paidAmount" type="number" step="0.01" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" />
                 </div>
                 <div className="flex justify-between items-center text-red-600">
                    <Label className="text-base font-semibold">Due Amount</Label>
                    <p className="text-xl font-bold">৳{dueAmount.toFixed(2)}</p>
                 </div>
             </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">
            Record Bill
          </Button>
        </CardFooter>
      </Card>
    </form>
    
    <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
      <DialogContent>
          <DialogHeader><DialogTitle>Add New Supplier</DialogTitle><DialogDescription>Enter the details for the new supplier.</DialogDescription></DialogHeader>
          <form onSubmit={handleAddSupplierSubmit} className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="name">Supplier Name</Label><Input id="name" name="name" required /></div>
              <div className="space-y-2"><Label htmlFor="mobile">Mobile Number</Label><Input id="mobile" name="mobile" required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email (Optional)</Label><Input id="email" name="email" type="email" /></div>
              <div className="space-y-2"><Label htmlFor="address">Address (Optional)</Label><Input id="address" name="address" /></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setSupplierDialogOpen(false)}>Cancel</Button><Button type="submit">Create Supplier</Button></DialogFooter>
          </form>
      </DialogContent>
    </Dialog>

    <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Raw Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMaterialSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Material Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" required>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {expenseCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" placeholder="e.g., Kg, Pcs, Litre" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMaterialDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Material</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
