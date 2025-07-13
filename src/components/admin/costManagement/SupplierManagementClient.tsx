
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Supplier } from '@/types';
import { Textarea } from '@/components/ui/textarea';

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

  if (!isLoaded) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <>
      <div className="flex justify-end">
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
