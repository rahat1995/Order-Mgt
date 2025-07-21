
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Samity } from '@/types';

export function SamityManagementClient() {
  const { settings, addSamity, updateSamity, deleteSamity, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSamity, setEditingSamity] = useState<Samity | null>(null);

  const handleOpenDialog = (samity: Samity | null) => {
    setEditingSamity(samity);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingSamity(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    if (editingSamity) {
      updateSamity({ ...editingSamity, name });
    } else {
      addSamity({ name });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading Samities...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Samities</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Samity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.samities.length > 0 ? (
              settings.samities.map(samity => (
                <div key={samity.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{samity.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(samity)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSamity(samity.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No Samities found. Click "Add Samity" to start.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSamity ? 'Edit Samity' : 'Add New Samity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Samity Name</Label>
                <Input id="name" name="name" defaultValue={editingSamity?.name} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingSamity ? 'Save Changes' : 'Create Samity'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
