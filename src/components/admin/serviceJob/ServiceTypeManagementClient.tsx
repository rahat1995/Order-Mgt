
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { ServiceType } from '@/types';
import * as XLSX from 'xlsx';

export function ServiceTypeManagementClient() {
  const { settings, addServiceType, updateServiceType, deleteServiceType, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServiceType | null>(null);

  const handleOpenDialog = (type: ServiceType | null) => {
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

    if (!name) return;

    if (editingType) {
      updateServiceType({ ...editingType, name });
    } else {
      addServiceType({ name });
    }
    handleCloseDialog();
  };
  
  const handleDownloadFormat = () => {
    const headers = ["typeName"];
    const exampleData = [{ typeName: "Sample Type (e.g., Hardware Repair)" }];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Types");
    XLSX.writeFile(wb, "service_type_format.csv");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        let itemsAdded = 0;
        let errors: string[] = [];

        json.forEach((row, index) => {
          const { typeName } = row;
          if (!typeName) {
            errors.push(`Row ${index + 2}: Missing required field 'typeName'.`);
            return;
          }
          addServiceType({ name: typeName });
          itemsAdded++;
        });

        alert(`${itemsAdded} service types added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isLoaded) {
      return <div>Loading service types...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Service Types</CardTitle>
              <CardDescription>A list of predefined service categories (e.g., Repair, Maintenance).</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download Format
                 </Button>
                 <Button asChild variant="outline" size="sm">
                    <Label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Upload CSV
                        <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                    </Label>
                 </Button>
                <Button onClick={() => handleOpenDialog(null)} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Service Type
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {settings.serviceTypes.length > 0 ? (
              settings.serviceTypes.map(type => (
                <div key={type.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{type.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(type)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteServiceType(type.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No service types found. Click "Add Service Type" to create one.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Service Type' : 'Add New Service Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Type Name</Label>
                <Input id="name" name="name" defaultValue={editingType?.name} required />
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
