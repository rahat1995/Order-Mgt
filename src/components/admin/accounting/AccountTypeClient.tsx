
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { AccountType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';

export function AccountTypeClient() {
  const { settings, addAccountType, updateAccountType, deleteAccountType, isLoaded } = useSettings();
  const { accountTypes } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AccountType | null>(null);

  const handleOpenDialog = (type: AccountType | null) => {
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
      updateAccountType({ ...editingType, name, code });
    } else {
      addAccountType({ name, code });
    }
    handleCloseDialog();
  };

  const handleDownloadFormat = () => {
    const headers = ["name", "code"];
    const exampleData = [
      { name: "Asset", code: "ASSET" },
      { name: "Liability", code: "LIABILITY" },
      { name: "Income", code: "INCOME" },
      { name: "Expense", code: "EXPENSE" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AccountTypes");
    XLSX.writeFile(wb, "account_types_format.xlsx");
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
          const { name, code } = row;

          if (!name || !code) {
            errors.push(`Row ${index + 2}: Missing required fields (name, code).`);
            return;
          }
          
          if (!accountTypes.some(at => at.code.toLowerCase() === code.toString().toLowerCase())) {
            addAccountType({
              name: name.toString(),
              code: code.toString().toUpperCase(),
            });
            itemsAdded++;
          }
        });

        alert(`${itemsAdded} new account types added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file. Please ensure it is a valid Excel file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isLoaded) {
    return <div>Loading account types...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Account Types</CardTitle>
            <div className="flex items-center gap-2">
                 <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download Format
                 </Button>
                 <Button asChild variant="outline" size="sm">
                    <Label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Upload Types
                        <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                    </Label>
                 </Button>
                <Button onClick={() => handleOpenDialog(null)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Type
                </Button>
            </div>
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
                {accountTypes.length > 0 ? (
                accountTypes.map(type => (
                    <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{type.code}</TableCell>
                        <TableCell className="text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(type)}>
                                <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAccountType(type.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No account types found. Click "Add Type" to start.
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
            <DialogTitle>{editingType ? 'Edit Account Type' : 'Add New Account Type'}</DialogTitle>
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
