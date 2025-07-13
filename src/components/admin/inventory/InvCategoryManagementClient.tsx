
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, ChevronRight } from 'lucide-react';
import type { ProductCategory } from '@/types';
import { cn } from '@/lib/utils';


type DialogState = {
  isOpen: boolean;
  type: 'Group' | 'Category' | 'Sub-Category' | null;
  editingCategory: ProductCategory | null;
  parentCategory?: ProductCategory;
};

export function InvCategoryManagementClient() {
  const { settings, addInvProductCategory, updateInvProductCategory, deleteInvProductCategory, isLoaded } = useSettings();
  const { invProductCategories } = settings;

  const [selectedGroup, setSelectedGroup] = useState<ProductCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, editingCategory: null });

  const { groups, categories, subCategories } = useMemo(() => {
    const allGroups = invProductCategories.filter(c => !c.parentId);
    const allCategories = invProductCategories.filter(c => c.parentId && allGroups.some(g => g.id === c.parentId));
    const allSubCategories = invProductCategories.filter(c => c.parentId && allCategories.some(cat => cat.id === c.parentId));
    return { groups: allGroups, categories: allCategories, subCategories: allSubCategories };
  }, [invProductCategories]);
  
  const handleSelectGroup = (group: ProductCategory) => {
    setSelectedGroup(group);
    setSelectedCategory(null); // Reset sub-category selection
  };

  const handleSelectCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
  };
  
  const handleOpenDialog = (type: 'Group' | 'Category' | 'Sub-Category', editing: ProductCategory | null, parent?: ProductCategory) => {
    setDialogState({ isOpen: true, type: type, editingCategory: editing, parentCategory: parent });
  };
  
  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, type: null, editingCategory: null });
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;

    if (!name) return;

    if (dialogState.editingCategory) {
      updateInvProductCategory({ ...dialogState.editingCategory, name, code });
    } else {
      addInvProductCategory({ name, code, parentId: dialogState.parentCategory?.id });
    }
    handleCloseDialog();
  };
  
  const handleDelete = (category: ProductCategory) => {
    let childExists = false;
    if (category.parentId) { // it's a category or sub-category
        childExists = invProductCategories.some(c => c.parentId === category.id);
    } else { // it's a group
        childExists = categories.some(c => c.parentId === category.id);
    }
    
    if (childExists) {
        alert(`Cannot delete "${category.name}" because it contains other categories. Please delete its children first.`);
        return;
    }

    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
        deleteInvProductCategory(category.id);
        if (selectedGroup?.id === category.id) setSelectedGroup(null);
        if (selectedCategory?.id === category.id) setSelectedCategory(null);
    }
  }

  const renderColumn = (
    title: string,
    items: ProductCategory[],
    selectedItem: ProductCategory | null,
    onSelectItem: (item: ProductCategory) => void,
    onAdd: () => void,
    onEdit: (item: ProductCategory) => void,
    showAddButton: boolean
  ) => (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showAddButton && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {items.length > 0 ? (
          items.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={cn(
                "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/80 group",
                selectedItem?.id === item.id && "bg-muted font-semibold"
              )}
            >
                <span>{item.name}</span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDelete(item); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground pt-8">
            {title === "Groups" ? "No groups yet." : `Select a ${title === 'Categories' ? 'group' : 'category'} to see its children.`}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!isLoaded) {
    return <div>Loading categories...</div>;
  }

  const filteredCategories = selectedGroup ? categories.filter(c => c.parentId === selectedGroup.id) : [];
  const filteredSubCategories = selectedCategory ? subCategories.filter(c => c.parentId === selectedCategory.id) : [];

  return (
    <>
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        {renderColumn('Groups', groups, selectedGroup, handleSelectGroup, () => handleOpenDialog('Group', null), (g) => handleOpenDialog('Group', g), true)}
        {renderColumn('Categories', filteredCategories, selectedCategory, handleSelectCategory, () => handleOpenDialog('Category', null, selectedGroup!), (c) => handleOpenDialog('Category', c, selectedGroup!), !!selectedGroup)}
        {renderColumn('Sub-Categories', filteredSubCategories, null, () => {}, () => handleOpenDialog('Sub-Category', null, selectedCategory!), (sc) => handleOpenDialog('Sub-Category', sc, selectedCategory!), !!selectedCategory)}
      </div>

      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
                {dialogState.editingCategory ? `Edit ${dialogState.type}` : `Add New ${dialogState.type}`}
            </DialogTitle>
            {dialogState.parentCategory && <CardDescription>Adding under "{dialogState.parentCategory.name}"</CardDescription>}
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={dialogState.editingCategory?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code (Optional)</Label>
                  <Input id="code" name="code" defaultValue={dialogState.editingCategory?.code} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{dialogState.editingCategory ? 'Save Changes' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
