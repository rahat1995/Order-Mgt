
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Attribute } from '@/types';

export function AttributeManagementClient() {
  const { settings, addAttribute, updateAttribute, deleteAttribute, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);

  const handleOpenDialog = (attribute: Attribute | null) => {
    setEditingAttribute(attribute);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingAttribute(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    if (editingAttribute) {
      updateAttribute({ ...editingAttribute, name });
    } else {
      addAttribute({ name });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading attributes...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Attributes</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Attribute
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.attributes.length > 0 ? (
              settings.attributes.map(attribute => (
                <div key={attribute.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{attribute.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(attribute)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAttribute(attribute.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No attributes found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Attribute Name</Label>
                <Input id="name" name="name" defaultValue={editingAttribute?.name} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingAttribute ? 'Save Changes' : 'Create Attribute'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
