
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Brand } from '@/types';

export function BrandManagementClient() {
  const { settings, addBrand, updateBrand, deleteBrand, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const handleOpenDialog = (brand: Brand | null) => {
    setEditingBrand(brand);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingBrand(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    if (editingBrand) {
      updateBrand({ ...editingBrand, name });
    } else {
      addBrand({ name });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading brands...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Brands</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Brand
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.invBrands.length > 0 ? (
              settings.invBrands.map(brand => (
                <div key={brand.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{brand.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(brand)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteBrand(brand.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No brands found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input id="name" name="name" defaultValue={editingBrand?.name} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingBrand ? 'Save Changes' : 'Create Brand'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
