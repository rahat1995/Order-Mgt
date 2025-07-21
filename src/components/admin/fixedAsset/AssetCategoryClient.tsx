
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { AssetCategory } from '@/types';
import * as XLSX from 'xlsx';

export function AssetCategoryClient() {
  const { settings, addAssetCategory, updateAssetCategory, deleteAssetCategory, isLoaded } = useSettings();
  const { assetCategories } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);

  const handleOpenDialog = (category: AssetCategory | null) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingCategory(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    if (editingCategory) {
      updateAssetCategory({ ...editingCategory, name });
    } else {
      addAssetCategory({ name });
    }
    handleCloseDialog();
  };

  const handleDownloadFormat = () => {
    const headers = ["categoryName"];
    const exampleData = [
      { categoryName: "Furniture" },
      { categoryName: "IT Equipment" },
      { categoryName: "Vehicles" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AssetCategories");
    XLSX.writeFile(wb, "asset_categories_format.xlsx");
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
          const { categoryName } = row;

          if (!categoryName) {
            errors.push(`Row ${index + 2}: Missing required field 'categoryName'.`);
            return;
          }
          
          if (!assetCategories.some(ac => ac.name.toLowerCase() === categoryName.toString().toLowerCase())) {
            addAssetCategory({ name: categoryName });
            itemsAdded++;
          }
        });

        alert(`${itemsAdded} new asset categories added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

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
    return <div>Loading categories...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Asset Categories</CardTitle>
            <div className="flex items-center gap-2">
                 <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download Format
                 </Button>
                 <Button asChild variant="outline" size="sm">
                    <Label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Upload Categories
                        <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                    </Label>
                 </Button>
                <Button onClick={() => handleOpenDialog(null)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {assetCategories.length > 0 ? (
              assetCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <p className="font-medium">{category.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAssetCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">No asset categories found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
