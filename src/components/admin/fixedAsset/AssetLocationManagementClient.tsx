
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { AssetLocation } from '@/types';

export function AssetLocationManagementClient() {
  const { settings, addAssetLocation, updateAssetLocation, deleteAssetLocation, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AssetLocation | null>(null);

  const handleOpenDialog = (location: AssetLocation | null) => {
    setEditingLocation(location);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingLocation(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    if (editingLocation) {
      updateAssetLocation({ ...editingLocation, name });
    } else {
      addAssetLocation({ name });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading locations...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Asset Locations</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.assetLocations.length > 0 ? (
              settings.assetLocations.map(location => (
                <div key={location.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{location.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(location)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAssetLocation(location.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No locations found. Click "Add Location" to start.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input id="name" name="name" defaultValue={editingLocation?.name} required placeholder="e.g., Head Office, Dhaka Branch" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingLocation ? 'Save Changes' : 'Create Location'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
