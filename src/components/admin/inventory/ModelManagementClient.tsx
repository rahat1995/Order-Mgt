
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Model } from '@/types';

export function ModelManagementClient() {
  const { settings, addModel, updateModel, deleteModel, isLoaded } = useSettings();
  const { invModels, invBrands } = settings;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  const handleOpenDialog = (model: Model | null) => {
    setEditingModel(model);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingModel(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const brandId = formData.get('brandId') as string;
    if (!name || !brandId) return;

    if (editingModel) {
      updateModel({ ...editingModel, name, brandId });
    } else {
      addModel({ name, brandId });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading models...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Models</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm" disabled={invBrands.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Model
            </Button>
          </div>
           {invBrands.length === 0 && <CardDescription className="text-destructive">Please add a Brand before adding a Model.</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {invModels.length > 0 ? (
              invModels.map(model => {
                const brand = invBrands.find(b => b.id === model.brandId);
                return (
                  <div key={model.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{brand?.name || 'Unknown Brand'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(model)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteModel(model.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No models found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name</Label>
                <Input id="name" name="name" defaultValue={editingModel?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <Select name="brandId" defaultValue={editingModel?.brandId} required>
                    <SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger>
                    <SelectContent>
                        {invBrands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingModel ? 'Save Changes' : 'Create Model'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
