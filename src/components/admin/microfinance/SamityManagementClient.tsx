

'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Samity } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const meetingDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export function SamityManagementClient() {
  const { settings, addSamity, updateSamity, deleteSamity, isLoaded } = useSettings();
  const { samities, microfinanceSettings, branches, workingAreas } = settings;
  const { samityTerm } = microfinanceSettings;
  
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
    const samityData = {
      name: formData.get('name') as string,
      branchId: formData.get('branchId') as string,
      workingAreaId: formData.get('workingAreaId') as string,
      meetingDay: formData.get('meetingDay') as Samity['meetingDay'],
      openingDate: formData.get('openingDate') as string,
      maxMembers: parseInt(formData.get('maxMembers') as string, 10),
    };

    if (!samityData.name || !samityData.branchId || !samityData.workingAreaId || isNaN(samityData.maxMembers)) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingSamity) {
      updateSamity({ 
        ...editingSamity, 
        ...samityData 
      });
    } else {
      addSamity(samityData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading {samityTerm}s...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All {samityTerm}s</CardTitle>
            <Button onClick={() => handleOpenDialog(null)} size="sm" disabled={branches.length === 0 || workingAreas.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add {samityTerm}
            </Button>
          </div>
           {(branches.length === 0 || workingAreas.length === 0) && (
            <CardDescription className="text-destructive pt-2">
              Please add a Branch and a Working Area before adding a {samityTerm}.
            </CardDescription>
           )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>{samityTerm} Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Meeting Day</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samities.length > 0 ? (
                samities.map(samity => {
                  const branch = branches.find(b => b.id === samity.branchId);
                  return (
                    <TableRow key={samity.id}>
                      <TableCell className="font-mono">{samity.code}</TableCell>
                      <TableCell className="font-medium">{samity.name}</TableCell>
                      <TableCell>{branch?.name || 'N/A'}</TableCell>
                      <TableCell>{samity.meetingDay}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(samity)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSamity(samity.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No {samityTerm}s found. Click "Add {samityTerm}" to start.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSamity ? `Edit ${samityTerm}` : `Add New ${samityTerm}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{samityTerm} Name</Label>
                  <Input id="name" name="name" defaultValue={editingSamity?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchId">Responsible Office (Branch)</Label>
                  <Select name="branchId" defaultValue={editingSamity?.branchId} required disabled={!!editingSamity}>
                      <SelectTrigger><SelectValue placeholder="Select a branch"/></SelectTrigger>
                      <SelectContent>
                          {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  {editingSamity && <p className="text-xs text-muted-foreground">Branch cannot be changed after creation.</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="workingAreaId">Working Area</Label>
                  <Select name="workingAreaId" defaultValue={editingSamity?.workingAreaId} required>
                      <SelectTrigger><SelectValue placeholder="Select a working area"/></SelectTrigger>
                      <SelectContent>
                          {workingAreas.map(wa => <SelectItem key={wa.id} value={wa.id}>{wa.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="meetingDay">Meeting Day</Label>
                  <Select name="meetingDay" defaultValue={editingSamity?.meetingDay} required>
                      <SelectTrigger><SelectValue placeholder="Select a day"/></SelectTrigger>
                      <SelectContent>
                          {meetingDays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="openingDate">Opening Date</Label>
                  <Input id="openingDate" name="openingDate" type="date" defaultValue={editingSamity?.openingDate} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input id="maxMembers" name="maxMembers" type="number" defaultValue={editingSamity?.maxMembers} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingSamity ? 'Save Changes' : `Create ${samityTerm}`}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
