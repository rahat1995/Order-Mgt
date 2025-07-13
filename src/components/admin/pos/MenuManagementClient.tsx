'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { PlusCircle, Edit, Trash2, XCircle, Download, Upload } from 'lucide-react';
import type { MenuCategory, MenuItem, MenuItemVariant, MenuItemAddOn } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

type DialogState = {
  category: boolean;
  item: boolean;
};

type EditingState = {
  category: MenuCategory | null;
  item: MenuItem | null;
};

export function MenuManagementClient() {
  const {
    settings,
    addMenuCategory,
    updateMenuCategory,
    deleteMenuCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    isLoaded,
  } = useSettings();

  const [dialogOpen, setDialogOpen] = useState<DialogState>({ category: false, item: false });
  const [editing, setEditing] = useState<EditingState>({ category: null, item: null });
  const [currentItemCategoryId, setCurrentItemCategoryId] = useState<string>('');

  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '' });
  const [addOns, setAddOns] = useState<MenuItemAddOn[]>([]);
  const [newAddOn, setNewAddOn] = useState({ name: '', price: '' });

  const handleOpenCategoryDialog = (category: MenuCategory | null) => {
    setEditing(prev => ({ ...prev, category }));
    setDialogOpen(prev => ({ ...prev, category: true }));
  };

  const handleOpenItemDialog = (item: MenuItem | null, categoryId?: string) => {
    setEditing({ category: null, item });
    if (item) {
      setVariants(item.variants || []);
      setAddOns(item.addOns || []);
      setCurrentItemCategoryId(item.categoryId);
    } else {
      setVariants([]);
      setAddOns([]);
      setCurrentItemCategoryId(categoryId || '');
    }
    setNewVariant({ name: '', price: '' });
    setNewAddOn({ name: '', price: '' });
    setDialogOpen({ category: false, item: true });
  };

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    let parentId = formData.get('parentId') as string | undefined;

    if (parentId === 'none') {
      parentId = undefined;
    }

    if (!name) return;

    if (editing.category) {
      updateMenuCategory({ ...editing.category, name, code, parentId });
    } else {
      addMenuCategory({ name, code, parentId });
    }
    setDialogOpen(prev => ({ ...prev, category: false }));
  };

  const saveMenuItem = (formData: FormData) => {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const categoryId = formData.get('categoryId') as string;

    if (!name || isNaN(price) || !categoryId) {
        alert('Please fill in all required fields: Name, Price, and Category.');
        return false;
    }
    
    const itemData = { 
      name, 
      price, 
      description, 
      categoryId, 
      image: image || 'https://placehold.co/400x300.png',
      variants,
      addOns 
    };

    if (editing.item) {
      updateMenuItem({ ...editing.item, ...itemData });
    } else {
      addMenuItem(itemData);
    }
    return true;
  }

  const handleMenuItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (saveMenuItem(formData)) {
      setDialogOpen(prev => ({ ...prev, item: false }));
    }
  };

  const handleSaveAndAddNew = () => {
    const form = document.getElementById('menu-item-form') as HTMLFormElement;
    if (!form) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    if (saveMenuItem(formData)) {
      form.reset();
      setEditing(prev => ({ ...prev, item: null }));
      setVariants([]);
      setAddOns([]);
      setNewVariant({ name: '', price: '' });
      setNewAddOn({ name: '', price: '' });
      const nameInput = document.getElementById('item-name') as HTMLInputElement;
      nameInput?.focus();
    }
  }


  const handleAddVariant = () => {
    if (newVariant.name && newVariant.price) {
        setVariants([...variants, { id: uuidv4(), name: newVariant.name, price: parseFloat(newVariant.price) }]);
        setNewVariant({ name: '', price: '' });
    }
  }

  const handleRemoveVariant = (id: string) => {
      setVariants(variants.filter(v => v.id !== id));
  }

  const handleAddAddOn = () => {
    if (newAddOn.name && newAddOn.price) {
        setAddOns([...addOns, { id: uuidv4(), name: newAddOn.name, price: parseFloat(newAddOn.price) }]);
        setNewAddOn({ name: '', price: '' });
    }
  }

  const handleRemoveAddOn = (id: string) => {
      setAddOns(addOns.filter(a => a.id !== id));
  }

  const categoryTree = useMemo(() => {
    const categories = settings.menuCategories;
    const categoryMap: Map<string, any> = new Map(categories.map(c => [c.id, { ...c, children: [] }]));
    const tree: any[] = [];

    categories.forEach(c => {
        const categoryNode = categoryMap.get(c.id)!;
        if (c.parentId && categoryMap.has(c.parentId)) {
            const parentNode = categoryMap.get(c.parentId)!;
            parentNode.children.push(categoryNode);
        } else {
            tree.push(categoryNode);
        }
    });
    
    const sortNodes = (nodes: any[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(node => sortNodes(node.children));
    };
    sortNodes(tree);

    return tree;
  }, [settings.menuCategories]);

  const handleDownloadFormat = () => {
    const headers = ["itemName", "price", "description", "categoryCode", "imageURL"];
    const exampleData = [
      { itemName: "Sample Burger", price: 10.99, description: "A delicious sample burger", categoryCode: "BURG", imageURL: "https://placehold.co/400x300.png" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items");
    XLSX.writeFile(wb, "menu_item_format.csv");
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
          const { itemName, price, description, categoryCode, imageURL } = row;

          if (!itemName || !price || !categoryCode) {
            errors.push(`Row ${index + 2}: Missing required fields (itemName, price, categoryCode).`);
            return;
          }

          const category = settings.menuCategories.find(c => c.code === categoryCode.toString());
          if (!category) {
            errors.push(`Row ${index + 2}: Category with code "${categoryCode}" not found.`);
            return;
          }
          
          addMenuItem({
            name: itemName,
            price: parseFloat(price),
            description: description || '',
            categoryId: category.id,
            image: imageURL || 'https://placehold.co/400x300.png',
            variants: [],
            addOns: [],
          });
          itemsAdded++;
        });

        let alertMessage = `${itemsAdded} items added successfully.`;
        if (errors.length > 0) {
          alertMessage += `\n\nErrors encountered:\n${errors.join('\n')}`;
        }
        alert(alertMessage);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file. Please ensure it is a valid CSV or Excel file.");
      } finally {
        // Reset file input so the same file can be uploaded again if needed
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };


  if (!isLoaded) {
    return <div>Loading menu...</div>;
  }

  const renderCategoryTree = (categories: any[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={level === 0 ? 'mt-6' : 'mt-4'}>
        <div style={{ paddingLeft: `${level * 2}rem` }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{category.name}</CardTitle>
                {category.code && <CardDescription>Code: {category.code}</CardDescription>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenCategoryDialog(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMenuCategory(category.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {settings.menuItems.filter(item => item.categoryId === category.id).length > 0 ? (
                <div className="border rounded-md">
                  {settings.menuItems
                    .filter(item => item.categoryId === category.id)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" data-ai-hint="food dish" />
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm">{item.description}</p>
                            <p className="text-sm text-muted-foreground">Base Price: ৳{item.price.toFixed(2)}</p>
                            {(item.variants?.length > 0 || item.addOns?.length > 0) && (
                                <div className="text-xs text-muted-foreground/80 mt-1">
                                    {item.variants?.length > 0 && <span>{item.variants.length} Variants</span>}
                                    {(item.variants?.length > 0 && item.addOns?.length > 0) && <span> &bull; </span>}
                                    {item.addOns?.length > 0 && <span>{item.addOns.length} Add-ons</span>}
                                </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenItemDialog(item, category.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMenuItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No items in this category.</p>
              )}
            </CardContent>
          </Card>
        </div>
        {category.children.length > 0 && renderCategoryTree(category.children, level + 1)}
      </div>
    ));
  };

  return (
    <>
       <div className="flex justify-between items-center">
         <div className="flex gap-2">
            <Button onClick={handleDownloadFormat} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Format
            </Button>
            <Button asChild variant="outline" size="sm">
              <Label>
                <Upload className="mr-2 h-4 w-4" />
                Upload Items (CSV)
                <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
              </Label>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenCategoryDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button onClick={() => handleOpenItemDialog(null)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
       </div>
      
      <div>
        {categoryTree.length > 0 
          ? renderCategoryTree(categoryTree) 
          : (
            <Card className="text-center py-12 mt-6">
              <CardHeader>
                <CardTitle>No Categories Found</CardTitle>
                <CardDescription>Click "Add Category" to create your first menu category.</CardDescription>
              </CardHeader>
            </Card>
          )}
      </div>

      {/* Category Dialog */}
      <Dialog open={dialogOpen.category} onOpenChange={(open) => setDialogOpen(p => ({ ...p, category: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing.category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editing.category ? 'Update the details of your category.' : 'Give your new category a name and optionally assign a parent.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editing.category?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" name="code" defaultValue={editing.category?.code} />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <Select name="parentId" defaultValue={editing.category?.parentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {settings.menuCategories
                      .filter(cat => cat.id !== editing.category?.id)
                      .map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setDialogOpen(p => ({ ...p, category: false }))}>Cancel</Button>
              <Button type="submit">{editing.category ? 'Save Changes' : 'Create Category'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={dialogOpen.item} onOpenChange={(open) => setDialogOpen(p => ({ ...p, item: open }))}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.item ? 'Edit Menu Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editing.item ? 'Update the details of your menu item.' : 'Add a new item to your menu.'}
            </DialogDescription>
          </DialogHeader>
          <form id="menu-item-form" onSubmit={handleMenuItemSubmit}>
            <div className="space-y-4 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Name</Label>
                  <Input id="item-name" name="name" defaultValue={editing.item?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-price">Base Price</Label>
                  <Input id="item-price" name="price" type="number" step="0.01" defaultValue={editing.item?.price} required/>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea id="item-description" name="description" defaultValue={editing.item?.description} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select name="categoryId" defaultValue={editing.item?.categoryId || currentItemCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.menuCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-image">Image URL</Label>
                  <Input id="item-image" name="image" defaultValue={editing.item?.image} placeholder="https://placehold.co/400x300.png" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Variants Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Variants</CardTitle>
                    <CardDescription>Different versions of the item, e.g., Small, Medium, Large.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {variants.map(variant => (
                        <div key={variant.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                            <span>{variant.name}</span>
                            <span>৳{variant.price.toFixed(2)}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveVariant(variant.id)}>
                                <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                     ))}
                     {variants.length === 0 && <p className="text-sm text-center text-muted-foreground py-2">No variants added.</p>}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                      <Input placeholder="Variant Name" value={newVariant.name} onChange={(e) => setNewVariant({...newVariant, name: e.target.value})} />
                      <Input placeholder="Price" type="number" step="0.01" value={newVariant.price} onChange={(e) => setNewVariant({...newVariant, price: e.target.value})} />
                      <Button type="button" onClick={handleAddVariant}>Add</Button>
                  </CardFooter>
                </Card>

                {/* Add-ons Section */}
                 <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add-ons</CardTitle>
                    <CardDescription>Extra items that can be added, e.g., Extra Cheese.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     {addOns.map(addOn => (
                        <div key={addOn.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                            <span>{addOn.name}</span>
                            <span>+৳{addOn.price.toFixed(2)}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveAddOn(addOn.id)}>
                                <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                     ))}
                     {addOns.length === 0 && <p className="text-sm text-center text-muted-foreground py-2">No add-ons added.</p>}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                      <Input placeholder="Add-on Name" value={newAddOn.name} onChange={(e) => setNewAddOn({...newAddOn, name: e.target.value})} />
                      <Input placeholder="Price" type="number" step="0.01" value={newAddOn.price} onChange={(e) => setNewAddOn({...newAddOn, price: e.target.value})} />
                      <Button type="button" onClick={handleAddAddOn}>Add</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(p => ({ ...p, item: false }))}>Cancel</Button>
               <Button type="submit" form="menu-item-form">{editing.item ? 'Save Changes' : 'Create Item'}</Button>
              {!editing.item && (
                <Button type="button" onClick={handleSaveAndAddNew}>Save &amp; Add New</Button>
              )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
