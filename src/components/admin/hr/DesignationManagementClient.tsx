
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Designation } from '@/types';

export function DesignationManagementClient() {
  const { settings, addDesignation, updateDesignation, deleteDesignation, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);

  const handleOpenDialog = (designation: Designation | null) => {
    setEditingDesignation(designation);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingDesignation(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    if (editingDesignation) {
      updateDesignation({ ...editingDesignation, name });
    } else {
      addDesignation({ name });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading designations...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Designations</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Designation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.designations.length > 0 ? (
              settings.designations.map(designation => (
                <div key={designation.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{designation.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(designation)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDesignation(designation.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No designations found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDesignation ? 'Edit Designation' : 'Add New Designation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Designation Name</Label>
                <Input id="name" name="name" defaultValue={editingDesignation?.name} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingDesignation ? 'Save Changes' : 'Create Designation'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
