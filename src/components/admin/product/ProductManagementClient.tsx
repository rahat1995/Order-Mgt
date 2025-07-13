
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
import type { ProductCategory, Product } from '@/types';
import * as XLSX from 'xlsx';

type DialogState = {
  category: boolean;
  item: boolean;
};

type EditingState = {
  category: ProductCategory | null;
  item: Product | null;
};

export function ProductManagementClient() {
  const {
    settings,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoaded,
  } = useSettings();

  const [dialogOpen, setDialogOpen] = useState<DialogState>({ category: false, item: false });
  const [editing, setEditing] = useState<EditingState>({ category: null, item: null });
  const [currentItemCategoryId, setCurrentItemCategoryId] = useState<string>('');

  const { productCategories, products } = settings;

  const handleOpenCategoryDialog = (category: ProductCategory | null) => {
    setEditing(prev => ({ ...prev, category }));
    setDialogOpen(prev => ({ ...prev, category: true }));
  };

  const handleOpenItemDialog = (item: Product | null, categoryId?: string) => {
    setEditing({ category: null, item });
    if (item) {
        setCurrentItemCategoryId(item.categoryId);
    } else {
        const defaultCategoryId = categoryId || (productCategories.length > 0 ? productCategories[0].id : '');
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
    const code = formData.get('code') as string;

    if (!name) return;

    if (editing.category) {
      updateProductCategory({ ...editing.category, name, code });
    } else {
      addProductCategory({ name, code });
    }
    handleCloseDialogs();
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;

    if (!name || isNaN(price) || !categoryId) {
        alert('Please fill in all required fields: Name, Price, and Category.');
        return;
    }
    
    const itemData = { name, price, categoryId, description };

    if (editing.item) {
      updateProduct({ ...editing.item, ...itemData });
    } else {
      addProduct(itemData);
    }
    handleCloseDialogs();
  };
  
  const handleDownloadFormat = () => {
    const headers = ["productName", "price", "description", "categoryCode"];
    const exampleData = [
      { productName: "Sample Laptop", price: 120000, description: "A high-performance sample laptop", categoryCode: "LPTP" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "product_format.csv");
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
          const { productName, price, description, categoryCode } = row;

          if (!productName || !price || !categoryCode) {
            errors.push(`Row ${index + 2}: Missing required fields (productName, price, categoryCode).`);
            return;
          }

          const category = productCategories.find(c => c.code?.toLowerCase() === categoryCode.toString().toLowerCase());
          if (!category) {
            errors.push(`Row ${index + 2}: Category with code "${categoryCode}" not found. Please create it first.`);
            return;
          }
          
          addProduct({
            name: productName,
            price: parseFloat(price),
            description: description || '',
            categoryId: category.id,
          });
          itemsAdded++;
        });

        alert(`${itemsAdded} products added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

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
    return <div>Loading products...</div>;
  }

  return (
    <>
       <div className="flex justify-end gap-2">
            <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Format
            </Button>
            <Button asChild variant="outline" size="sm">
                <Label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Products
                    <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                </Label>
            </Button>
            <Button onClick={() => handleOpenCategoryDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button onClick={() => handleOpenItemDialog(null)} size="sm" disabled={productCategories.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
      </div>
      
      <div className="space-y-6 mt-4">
        {productCategories.length > 0 
          ? productCategories.map(category => (
            <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{category.name}</CardTitle>
                        {category.code && <CardDescription>Code: {category.code}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenCategoryDialog(category)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProductCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        {products.filter(item => item.categoryId === category.id).length > 0 ? (
                           products.filter(item => item.categoryId === category.id).map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm font-medium">৳{item.price.toFixed(2)}</p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenItemDialog(item, category.id)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProduct(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                           ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center p-4">No products in this category.</p>
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
                <CardTitle>No Product Categories Found</CardTitle>
                <CardDescription>Click "Add Category" to create your first product category.</CardDescription>
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
               <div className="space-y-2">
                <Label htmlFor="code">Category Code</Label>
                <Input id="code" name="code" placeholder="e.g., LPTP for Laptops" defaultValue={editing.category?.code} />
                <p className="text-xs text-muted-foreground">A unique code used for CSV imports.</p>
              </div>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={handleCloseDialogs}>Cancel</Button>
              <Button type="submit">{editing.category ? 'Save Changes' : 'Create Category'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Item Dialog */}
      <Dialog open={dialogOpen.item} onOpenChange={(open) => setDialogOpen(p => ({ ...p, item: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.item ? 'Edit Product' : 'Add New Product'}</DialogTitle>

          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Product Name</Label>
                  <Input id="item-name" name="name" defaultValue={editing.item?.name} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="item-description">Description (Optional)</Label>
                  <Input id="item-description" name="description" defaultValue={editing.item?.description} />
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
                      {productCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>Cancel</Button>
              <Button type="submit">{editing.item ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
