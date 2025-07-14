
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { Supplier } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import * as XLSX from 'xlsx';


export function SupplierManagementClient() {
  const { settings, addSupplier, updateSupplier, deleteSupplier, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleOpenDialog = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingSupplier(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supplierData: Omit<Supplier, 'id'> = {
      name: formData.get('name') as string,
      mobile: formData.get('mobile') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };

    if (!supplierData.name || !supplierData.mobile) {
        alert("Supplier Name and Mobile Number are required.");
        return;
    }

    if (editingSupplier) {
      updateSupplier({ ...editingSupplier, ...supplierData });
    } else {
      addSupplier(supplierData);
    }
    handleCloseDialog();
  };
  
  const handleDownloadFormat = () => {
    const headers = ["name", "mobile", "contactPerson", "email", "address"];
    const exampleData = [
      { name: "Global Food Supplies", mobile: "9876543210", contactPerson: "Mr. Sharma", email: "sharma@globalfood.com", address: "123 Supply Chain Rd, Mumbai" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    XLSX.writeFile(wb, "supplier_import_format.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        let itemsAdded = 0;
        let errors: string[] = [];

        json.forEach((row, index) => {
          const { name, mobile, contactPerson, email, address } = row;

          if (!name || !mobile) {
            errors.push(`Row ${index + 2}: Missing required fields (name, mobile).`);
            return;
          }
          
          addSupplier({
            name,
            mobile: String(mobile),
            contactPerson,
            email,
            address,
          });
          itemsAdded++;
        });

        alert(`${itemsAdded} suppliers added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file. Please ensure it is a valid Excel file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };


  if (!isLoaded) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <>
      <div className="flex justify-end gap-2">
         <Button onClick={handleDownloadFormat} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download Format
         </Button>
         <Button asChild variant="outline" size="sm">
            <Label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Upload Suppliers
                <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
            </Label>
         </Button>
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.suppliers.map(supplier => (
          <Card key={supplier.id}>
            <CardHeader>
              <CardTitle>{supplier.name}</CardTitle>
              <CardDescription>{supplier.contactPerson || 'No contact person'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">{supplier.mobile}</p>
              <p className="text-sm text-muted-foreground">{supplier.email}</p>
              <p className="text-sm text-muted-foreground">{supplier.address}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(supplier)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSupplier(supplier.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {settings.suppliers.length === 0 && (
          <Card className="text-center py-12 col-span-full">
            <CardHeader>
              <CardTitle>No Suppliers Found</CardTitle>
              <CardDescription>Click "Add New Supplier" to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Update the supplier\'s details.' : 'Enter the details for the new supplier.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input id="name" name="name" defaultValue={editingSupplier?.name} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" name="contactPerson" defaultValue={editingSupplier?.contactPerson} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" name="mobile" defaultValue={editingSupplier?.mobile} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingSupplier?.email} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea id="address" name="address" defaultValue={editingSupplier?.address} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingSupplier ? 'Save Changes' : 'Create Supplier'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
