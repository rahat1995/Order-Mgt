
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Branch } from '@/types';

export function BranchManagementForm() {
  const { settings, addBranch, updateBranch, deleteBranch, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const handleOpenDialog = (branch: Branch | null) => {
    setEditingBranch(branch);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingBranch(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const startDate = formData.get('startDate') as string;
    
    if (!name || !code || !startDate) return;

    if (editingBranch) {
      updateBranch({ ...editingBranch, name, code, startDate });
    } else {
      addBranch({ name, code, startDate });
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading branch settings...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Branch Management</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </div>
          <CardDescription>Define your organization's branches or locations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.branches.length > 0 ? (
              settings.branches.map(branch => (
                <div key={branch.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">Code: {branch.code} | Start Date: {new Date(branch.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(branch)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteBranch(branch.id)} disabled={branch.id === 'default-ho'}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No branches found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Branch Name</Label>
                    <Input id="name" name="name" defaultValue={editingBranch?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Branch Code</Label>
                    <Input id="code" name="code" defaultValue={editingBranch?.code} required />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" defaultValue={editingBranch?.startDate} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingBranch ? 'Save Changes' : 'Create Branch'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
