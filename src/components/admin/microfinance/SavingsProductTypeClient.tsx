
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { SavingsProductType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SavingsProductTypeClient() {
  const { settings, addSavingsProductType, updateSavingsProductType, deleteSavingsProductType, isLoaded } = useSettings();
  const { savingsProductTypes } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<SavingsProductType | null>(null);

  const handleOpenDialog = (type: SavingsProductType | null) => {
    setEditingType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingType(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;

    if (!name || !code) {
        alert("Name and Code are required.");
        return;
    }

    if (editingType) {
      updateSavingsProductType({ ...editingType, name, code });
    } else {
      addSavingsProductType({ name, code });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading savings product types...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Savings Types</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Type Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {savingsProductTypes.length > 0 ? (
                savingsProductTypes.map(type => (
                    <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{type.code}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(type)}>
                                <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSavingsProductType(type.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No savings product types found. Click "Add Type" to start.
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
            <DialogTitle>{editingType ? 'Edit Savings Type' : 'Add New Savings Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Type Name</Label>
                <Input id="name" name="name" defaultValue={editingType?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Type Code</Label>
                <Input id="code" name="code" defaultValue={editingType?.code} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingType ? 'Save Changes' : 'Create Type'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
