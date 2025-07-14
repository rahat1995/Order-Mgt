
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { RawMaterial } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function RawMaterialClient() {
  const { settings, addRawMaterial, updateRawMaterial, deleteRawMaterial, isLoaded } = useSettings();
  const { rawMaterials, expenseCategories } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const handleOpenDialog = (material: RawMaterial | null) => {
    setEditingMaterial(material);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingMaterial(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;
    const categoryId = formData.get('categoryId') as string;

    if (!name || !unit || !categoryId) return;

    if (editingMaterial) {
      updateRawMaterial({ ...editingMaterial, name, unit, categoryId });
    } else {
      addRawMaterial({ name, unit, categoryId });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading raw materials...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Raw Materials</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm" disabled={expenseCategories.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Material
            </Button>
          </div>
          {expenseCategories.length === 0 && <CardDescription className="text-destructive pt-2">Please add an Expense Category before adding a material.</CardDescription>}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rawMaterials.length > 0 ? (
                rawMaterials.map(material => {
                    const category = expenseCategories.find(c => c.id === material.categoryId);
                    return (
                        <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.name}</TableCell>
                            <TableCell>{category?.name || 'N/A'}</TableCell>
                            <TableCell>{material.unit}</TableCell>
                            <TableCell className="text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(material)}>
                                    <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRawMaterial(material.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No raw materials found. Click "Add Material" to start.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Material Name</Label>
                <Input id="name" name="name" defaultValue={editingMaterial?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" defaultValue={editingMaterial?.categoryId} required>
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
                <Input id="unit" name="unit" placeholder="e.g., Kg, Pcs, Litre" defaultValue={editingMaterial?.unit} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingMaterial ? 'Save Changes' : 'Create Material'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
