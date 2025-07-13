
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { ServiceItemCategory, ServiceItem } from '@/types';
import * as XLSX from 'xlsx';

type DialogState = {
  category: boolean;
  item: boolean;
};

type EditingState = {
  category: ServiceItemCategory | null;
  item: ServiceItem | null;
};

export function ServiceItemManagementClient() {
  const {
    settings,
    addServiceItemCategory,
    updateServiceItemCategory,
    deleteServiceItemCategory,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    isLoaded,
  } = useSettings();

  const [dialogOpen, setDialogOpen] = useState<DialogState>({ category: false, item: false });
  const [editing, setEditing] = useState<EditingState>({ category: null, item: null });
  const [currentItemCategoryId, setCurrentItemCategoryId] = useState<string>('');

  const { serviceItemCategories, serviceItems } = settings;

  const handleOpenCategoryDialog = (category: ServiceItemCategory | null) => {
    setEditing(prev => ({ ...prev, category }));
    setDialogOpen(prev => ({ ...prev, category: true }));
  };

  const handleOpenItemDialog = (item: ServiceItem | null, categoryId?: string) => {
    setEditing({ category: null, item });
    if (item) {
        setCurrentItemCategoryId(item.categoryId);
    } else {
        const defaultCategoryId = categoryId || (serviceItemCategories.length > 0 ? serviceItemCategories[0].id : '');
        setCurrentItemCategoryId(defaultCategoryId);
    }
    setDialogOpen({ category: false, item: true });
  };
  
  const handleCloseDialogs = () => {
      setDialogOpen({ category: false, item: false });
      setEditing({ category: null, item: null });
  }

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    if (!name) return;

    if (editing.category) {
      updateServiceItemCategory({ ...editing.category, name });
    } else {
      addServiceItemCategory({ name });
    }
    handleCloseDialogs();
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;

    if (!name || isNaN(price) || !categoryId) {
        alert('Please fill in all required fields: Name, Price, and Category.');
        return;
    }
    
    const itemData = { name, price, categoryId };

    if (editing.item) {
      updateServiceItem({ ...editing.item, ...itemData });
    } else {
      addServiceItem(itemData);
    }
    handleCloseDialogs();
  };
  
  const handleDownloadFormat = () => {
    const headers = ["itemName", "price", "categoryName"];
    const exampleData = [
      { itemName: "Sample Service/Part", price: 99.99, categoryName: "Sample Category Name" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Service Items");
    XLSX.writeFile(wb, "service_item_format.csv");
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
          const { itemName, price, categoryName } = row;

          if (!itemName || !price || !categoryName) {
            errors.push(`Row ${index + 2}: Missing required fields (itemName, price, categoryName).`);
            return;
          }

          const category = serviceItemCategories.find(c => c.name.toLowerCase() === categoryName.toString().toLowerCase());
          if (!category) {
            errors.push(`Row ${index + 2}: Category with name "${categoryName}" not found. Please create it first.`);
            return;
          }
          
          addServiceItem({
            name: itemName,
            price: parseFloat(price),
            categoryId: category.id,
          });
          itemsAdded++;
        });

        alert(`${itemsAdded} items added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file. Please ensure it is a valid CSV or Excel file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };


  if (!isLoaded) {
    return <div>Loading service items...</div>;
  }

  return (
    <>
       <div className="flex justify-end gap-2">
            <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Format
            </Button>
            <Button asChild variant="outline" size="sm">
                <Label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Items
                    <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                </Label>
            </Button>
            <Button onClick={() => handleOpenCategoryDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button onClick={() => handleOpenItemDialog(null)} size="sm" disabled={serviceItemCategories.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service/Part
            </Button>
      </div>
      
      <div className="space-y-6 mt-4">
        {serviceItemCategories.length > 0 
          ? serviceItemCategories.map(category => (
            <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{category.name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenCategoryDialog(category)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteServiceItemCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        {serviceItems.filter(item => item.categoryId === category.id).length > 0 ? (
                           serviceItems.filter(item => item.categoryId === category.id).map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-medium">৳{item.price.toFixed(2)}</p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenItemDialog(item, category.id)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteServiceItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                           ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center p-4">No services or parts in this category.</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => handleOpenItemDialog(null, category.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add to {category.name}
                    </Button>
                </CardFooter>
            </Card>
          ))
          : (
            <Card className="text-center py-12 mt-6">
              <CardHeader>
                <CardTitle>No Categories Found</CardTitle>
                <CardDescription>Click "Add Category" to create your first service/part category.</CardDescription>
              </CardHeader>
            </Card>
          )}
      </div>

      {/* Category Dialog */}
      <Dialog open={dialogOpen.category} onOpenChange={(open) => setDialogOpen(p => ({ ...p, category: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" defaultValue={editing.category?.name} required />
              </div>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={handleCloseDialogs}>Cancel</Button>
              <Button type="submit">{editing.category ? 'Save Changes' : 'Create Category'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service Item Dialog */}
      <Dialog open={dialogOpen.item} onOpenChange={(open) => setDialogOpen(p => ({ ...p, item: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.item ? 'Edit Service/Part' : 'Add New Service/Part'}</DialogTitle>

          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Name</Label>
                  <Input id="item-name" name="name" defaultValue={editing.item?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Price</Label>
                  <Input id="item-price" name="price" type="number" step="0.01" defaultValue={editing.item?.price} required/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select name="categoryId" defaultValue={editing.item?.categoryId || currentItemCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceItemCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>Cancel</Button>
              <Button type="submit">{editing.item ? 'Save Changes' : 'Create Item'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
