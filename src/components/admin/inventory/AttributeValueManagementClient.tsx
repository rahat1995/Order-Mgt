
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { AttributeValue } from '@/types';

export function AttributeValueManagementClient() {
  const { settings, addAttributeValue, updateAttributeValue, deleteAttributeValue, isLoaded } = useSettings();
  const { attributes, attributeValues } = settings;

  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(attributes.length > 0 ? attributes[0].id : null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);

  const handleOpenDialog = (value: AttributeValue | null) => {
    setEditingValue(value);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingValue(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAttributeId) return;

    const formData = new FormData(e.currentTarget);
    const value = formData.get('value') as string;
    if (!value) return;

    if (editingValue) {
      updateAttributeValue({ ...editingValue, value });
    } else {
      addAttributeValue({ attributeId: selectedAttributeId, value });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading attribute values...</div>;
  }
  
  const filteredValues = selectedAttributeId ? attributeValues.filter(v => v.attributeId === selectedAttributeId) : [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Attribute Values</CardTitle>
              <CardDescription>Select an attribute to view and manage its values.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)} size="sm" disabled={!selectedAttributeId}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Value
            </Button>
          </div>
           <div className="pt-4">
              <Label htmlFor="attribute-select">Attribute</Label>
              <Select value={selectedAttributeId || ''} onValueChange={setSelectedAttributeId}>
                  <SelectTrigger id="attribute-select"><SelectValue placeholder="Select an attribute..."/></SelectTrigger>
                  <SelectContent>
                      {attributes.map(attr => (
                          <SelectItem key={attr.id} value={attr.id}>{attr.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
           </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {filteredValues.length > 0 ? (
              filteredValues.map(value => (
                <div key={value.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{value.value}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(value)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAttributeValue(value.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No values found for this attribute.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingValue ? 'Edit Value' : `Add New Value for ${attributes.find(a => a.id === selectedAttributeId)?.name}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input id="value" name="value" defaultValue={editingValue?.value} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingValue ? 'Save Changes' : 'Create Value'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
