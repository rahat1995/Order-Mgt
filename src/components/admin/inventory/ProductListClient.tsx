



'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, PlusCircle, Edit, Trash2, XCircle, Search, ChevronsUpDown, Upload, Download } from 'lucide-react';
import type { InventoryProduct, InventoryProductVariant, ProductCategory, Brand, Model, CompositeItem, Attribute } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as XLSX from 'xlsx';
import { Checkbox } from '@/components/ui/checkbox';


type SelectedAttribute = {
  id: string; // Temp ID for the row
  attributeId: string;
  values: string[]; // Array of selected value IDs
};

type DialogState = {
    type: 'Brand' | 'Model' | 'Group' | 'Category' | 'SubCategory' | null;
    isOpen: boolean;
    parent?: ProductCategory;
};

export function ProductListClient() {
  const { settings, addInvProduct, updateInvProduct, deleteInvProduct, addBrand, addModel, addInvProductCategory, isLoaded, addInvProductCategory: addCategory } = useSettings();
  const { invProducts, invProductCategories, invBrands, invModels, attributes: definedAttributes, attributeValues } = settings;
  
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

  // State for new product form
  const [productType, setProductType] = useState<'standard' | 'variant' | 'composite'>('standard');
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([{ id: uuidv4(), attributeId: '', values: [] }]);
  const [generatedVariants, setGeneratedVariants] = useState<Partial<InventoryProductVariant>[]>([]);
  const [step, setStep] = useState(1);
  const [compositeItems, setCompositeItems] = useState<CompositeItem[]>([]);
  const [compositeSearch, setCompositeSearch] = useState('');
  
  const [applyAllPrice, setApplyAllPrice] = useState('');
  const [applyAllSku, setApplyAllSku] = useState('');


  // State for new entity dialogs
  const [entityDialogOpen, setEntityDialogOpen] = useState<DialogState>({ type: null, isOpen: false });

  // State for dropdown selections in product form
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  
  // State for popover visibility
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [subCategoryPopoverOpen, setSubCategoryPopoverOpen] = useState(false);
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [compositePopoverOpen, setCompositePopoverOpen] = useState(false);

  // State for filtering product list
  const [filterGroup, setFilterGroup] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterBarcode, setFilterBarcode] = useState('');

  const lastAddedRef = useRef<{type: DialogState['type'], id: string} | null>(null);
  
  // This effect listens for changes in the settings data (e.g., a new brand is added)
  // and automatically selects it if it was just added from the dialog.
  useEffect(() => {
    if (lastAddedRef.current) {
        const { type, id } = lastAddedRef.current;
        if (type === 'Brand') setSelectedBrand(id);
        if (type === 'Model') setSelectedModel(id);
        if (type === 'Group') setSelectedGroup(id);
        if (type === 'Category') setSelectedCategory(id);
        if (type === 'SubCategory') setSelectedSubCategory(id);
        lastAddedRef.current = null;
    }
  }, [invBrands, invModels, invProductCategories]);

  const handleOpenProductDialog = (product: InventoryProduct | null) => {
    setEditingProduct(product);
    if (product) {
      // Logic for editing would go here
      setProductType(product.type as 'standard' | 'variant' | 'composite');
      // This part needs more logic to trace back the full hierarchy for editing.
      // For now, we focus on creation.
    } else {
      // Reset form for new product
      setProductType('standard');
      setSelectedAttributes([{ id: uuidv4(), attributeId: '', values: [] }]);
      setGeneratedVariants([]);
      setStep(1);
      setCompositeItems([]);
      setSelectedGroup('');
      setSelectedCategory('');
      setSelectedSubCategory('');
      setSelectedBrand('');
      setSelectedModel('');
    }
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleAttributeSelectionChange = (id: string, newAttributeId: string) => {
    setSelectedAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, attributeId: newAttributeId, values: [] } : attr));
  };
  
  const handleValueSelectionChange = (id: string, valueId: string, checked: boolean) => {
    setSelectedAttributes(prev => prev.map(attr => {
      if (attr.id === id) {
        const newValues = checked ? [...attr.values, valueId] : attr.values.filter(v => v !== valueId);
        return { ...attr, values: newValues };
      }
      return attr;
    }));
  };

  const addAttributeRow = () => {
    setSelectedAttributes(prev => [...prev, { id: uuidv4(), attributeId: '', values: [] }]);
  };

  const removeAttributeRow = (id: string) => {
    setSelectedAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  const handleGenerateVariants = () => {
    const validAttributes = selectedAttributes.filter(attr => attr.attributeId && attr.values.length > 0);
    if (validAttributes.length === 0) {
      alert("Please select at least one attribute and one or more of its values.");
      return;
    }
    
    const valueArrays = validAttributes.map(attr => attr.values);

    const cartesian = <T,>(...a: T[][]): T[][] => a.reduce((acc, val) => acc.flatMap(d => val.map(e => [d, e].flat())), [[]] as T[][]);
    
    const combinations = cartesian(...valueArrays);
    
    const variants = combinations.map(combo => {
        const variantNameParts = combo.map(valueId => attributeValues.find(v => v.id === valueId)?.value).join(' - ');
        const skuPart = combo.map(valueId => attributeValues.find(v => v.id === valueId)?.value.slice(0, 3).toUpperCase()).join('-');
        
        return {
            id: uuidv4(),
            name: variantNameParts,
            sku: skuPart,
            barcode: '',
            price: 0,
            stock: 0,
        };
    });

    setGeneratedVariants(variants);
    setStep(2);
  };
  
  const handleVariantDetailChange = (id: string, field: 'price' | 'sku', value: string | number) => {
      setGeneratedVariants(prev => prev.map(v => v.id === id ? {...v, [field]: value} : v));
  }
  
  const handleApplyPriceToAll = () => {
    const price = parseFloat(applyAllPrice);
    if (isNaN(price) || price < 0) {
        alert("Please enter a valid price.");
        return;
    }
    setGeneratedVariants(prev => prev.map(v => ({ ...v, price })));
  };

  const handleApplySkuToAll = () => {
    if (!applyAllSku.trim()) {
        alert("Please enter a SKU suffix.");
        return;
    }
    setGeneratedVariants(prev => prev.map((v, index) => ({ ...v, sku: `${applyAllSku}-${index + 1}` })));
  };


  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const productName = (e.currentTarget.elements.namedItem('productName') as HTMLInputElement).value;
    const categoryId = selectedSubCategory || selectedCategory || selectedGroup;
    const brandId = selectedBrand;
    const modelId = selectedModel;
    const unit = (e.currentTarget.elements.namedItem('unit') as HTMLInputElement).value;
    const price = parseFloat((e.currentTarget.elements.namedItem('price') as HTMLInputElement)?.value);
    const sku = (e.currentTarget.elements.namedItem('sku') as HTMLInputElement)?.value;


    if (!productName || !categoryId) {
        alert("Product Name and a full Category path are required.");
        return;
    }
    
    if (productType !== 'composite' && !brandId) {
        alert("Brand is required for Standard and Variant products.");
        return;
    }

    const baseProductData = {
        name: productName,
        type: productType,
        categoryId: categoryId,
        brandId: brandId || undefined,
        modelId: modelId || undefined,
        unit,
    };
    
    if (productType === 'standard') {
      if (isNaN(price)) {
          alert("Price is required for standard products.");
          return;
      }
      
      const finalSku = sku || `${productName.slice(0,5).toUpperCase()}-${uuidv4().slice(0,4)}`;
      const newProduct: Omit<InventoryProduct, 'id'> = {
        ...baseProductData,
        variants: [{
            id: uuidv4(),
            name: 'Standard',
            sku: finalSku,
            barcode: finalSku,
            price,
            stock: 0
        }]
      };
      addInvProduct(newProduct);
    } else if (productType === 'variant') {
      if (generatedVariants.length === 0) {
        alert("No variants generated. Please define attributes and generate variants.");
        return;
      }
      if(generatedVariants.some(v => !v.price || v.price < 0 || !v.sku)) {
          alert("All variants must have a valid price and SKU suffix.");
          return;
      }

      const finalVariants = generatedVariants.map(v => {
          const finalSku = `${productName.slice(0,3).toUpperCase()}-${v.sku}`;
          return {
              id: v.id!,
              name: v.name!,
              price: v.price!,
              sku: finalSku,
              barcode: finalSku,
              stock: 0,
          }
      });
      
      const newProduct: Omit<InventoryProduct, 'id'> = {
        ...baseProductData,
        variants: finalVariants,
      };
      addInvProduct(newProduct);
    } else if (productType === 'composite') {
        if (compositeItems.length === 0) {
            alert('A composite product must contain at least one item.');
            return;
        }
        if (isNaN(price)) {
          alert("Price is required for composite products.");
          return;
        }
        const finalSku = sku || `${productName.slice(0,5).toUpperCase()}-${uuidv4().slice(0,4)}`;
        const newProduct: Omit<InventoryProduct, 'id'> = {
            ...baseProductData,
            variants: [{
                id: uuidv4(),
                name: 'Composite',
                sku: finalSku,
                barcode: finalSku,
                price,
                stock: 0,
            }],
            compositeItems: compositeItems,
        };
        addInvProduct(newProduct);
    }


    handleCloseProductDialog();
  };

  const getCategoryPath = (categoryId: string): string => {
    const path = [];
    let current = invProductCategories.find(c => c.id === categoryId);
    while (current) {
        path.unshift(current.name);
        current = current.parentId ? invProductCategories.find(c => c.id === current.parentId) : undefined;
    }
    return path.join(' > ');
  }
  
  const handleOpenEntityDialog = (type: DialogState['type'], parent?: ProductCategory) => {
      setEntityDialogOpen({ type, isOpen: true, parent });
  }

  const handleEntitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    let newEntityId = uuidv4();

    switch (entityDialogOpen.type) {
        case 'Brand': {
            addBrand({ name, id: newEntityId });
            lastAddedRef.current = {type: 'Brand', id: newEntityId};
            break;
        }
        case 'Model': {
            const brandId = selectedBrand;
            if (!brandId) { alert('A brand must be selected.'); return; }
            addModel({ name, brandId, id: newEntityId });
            lastAddedRef.current = {type: 'Model', id: newEntityId};
            break;
        }
        case 'Group':
        case 'Category': 
        case 'SubCategory': {
            let parentId = entityDialogOpen.parent?.id;
            addInvProductCategory({ id: newEntityId, name, parentId });
            lastAddedRef.current = {type: entityDialogOpen.type, id: newEntityId};
            break;
        }
    }
    setEntityDialogOpen({ type: null, isOpen: false });
  }

  const { groups, categories, subCategories } = useMemo(() => {
    const allGroups = invProductCategories.filter(c => !c.parentId);
    const allCategories = invProductCategories.filter(c => c.parentId && allGroups.some(g => g.id === c.parentId));
    const allSubCategories = invProductCategories.filter(c => c.parentId && allCategories.some(cat => cat.id === c.parentId));
    return { groups: allGroups, categories: allCategories, subCategories: allSubCategories };
  }, [invProductCategories]);


  const availableCompositeProducts = useMemo(() => {
    return invProducts
      .filter(p => p.type === 'standard' || p.type === 'variant')
      .flatMap(p => p.variants.map(v => ({
        product: p,
        variant: v,
        displayName: p.variants.length > 1 ? `${p.name} (${v.name})` : p.name,
        id: `${p.id}-${v.id}`
      })))
      .filter(item => {
        if (!compositeSearch) return true;
        return item.displayName.toLowerCase().includes(compositeSearch.toLowerCase());
      });
  }, [invProducts, compositeSearch]);

  const addCompositeItem = (product: InventoryProduct, variant: InventoryProductVariant) => {
    const existingItem = compositeItems.find(item => item.productId === product.id && item.variantId === variant.id);
    if (existingItem) {
        updateCompositeItemQty(product.id, variant.id, 1);
    } else {
        setCompositeItems(prev => [...prev, { productId: product.id, variantId: variant.id, quantity: 1 }]);
    }
    setCompositeSearch('');
    setCompositePopoverOpen(false);
  }

  const updateCompositeItemQty = (productId: string, variantId: string, delta: number) => {
    setCompositeItems(prev => prev.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
    }).filter(item => item.quantity > 0));
  }

  const filteredProducts = useMemo(() => {
    let tempProducts = [...invProducts];
    
    const getDescendantIds = (categoryId: string): string[] => {
        let ids: string[] = [categoryId];
        const children = invProductCategories.filter(c => c.parentId === categoryId);
        children.forEach(child => {
            ids = [...ids, ...getDescendantIds(child.id)];
        });
        return ids;
    };

    if (filterGroup) {
        const descendantIds = getDescendantIds(filterGroup);
        tempProducts = tempProducts.filter(p => descendantIds.includes(p.categoryId));
    }
    if (filterCategory) {
        const descendantIds = getDescendantIds(filterCategory);
        tempProducts = tempProducts.filter(p => descendantIds.includes(p.categoryId));
    }
    if (filterSubCategory) {
        tempProducts = tempProducts.filter(p => p.categoryId === filterSubCategory);
    }
    if (filterBrand) {
        tempProducts = tempProducts.filter(p => p.brandId === filterBrand);
    }
    if (filterModel) {
        tempProducts = tempProducts.filter(p => p.modelId === filterModel);
    }
    if (filterBarcode) {
        const lowerCaseBarcode = filterBarcode.toLowerCase();
        tempProducts = tempProducts.filter(p => 
            p.variants.some(v => v.barcode.toLowerCase().includes(lowerCaseBarcode) || v.sku.toLowerCase().includes(lowerCaseBarcode))
        );
    }
    
    return tempProducts;
  }, [invProducts, invProductCategories, filterGroup, filterCategory, filterSubCategory, filterBrand, filterModel, filterBarcode]);


  const handleDownloadFormat = () => {
    const headers = ["productName", "variantName", "price", "sku", "categoryPath", "brandName", "modelName", "unit"];
    const exampleData = [
      { productName: "T-Shirt", variantName: "Red", price: 500, sku: "TSHIRT-RED", categoryPath: "Apparel > Mens > Tops", brandName: "CoolBrand", modelName: "Summer Collection", unit: "Pcs" },
      { productName: "T-Shirt", variantName: "Blue", price: 500, sku: "TSHIRT-BLUE", categoryPath: "Apparel > Mens > Tops", brandName: "CoolBrand", modelName: "Summer Collection", unit: "Pcs" },
      { productName: "Mug", variantName: "Standard", price: 250, sku: "MUG-STD", categoryPath: "Homeware > Kitchen", brandName: "HomeGoods", modelName: "", unit: "Pcs" },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "inventory_product_format.xlsx");
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

        let itemsAddedCount = 0;
        const errors: string[] = [];
        
        const groupedByProduct = json.reduce((acc, row) => {
            const key = row.productName?.trim();
            if (!key) return acc;
            if (!acc[key]) acc[key] = [];
            acc[key].push(row);
            return acc;
        }, {} as Record<string, any[]>);

        for (const productName in groupedByProduct) {
            const rows = groupedByProduct[productName];
            const firstRow = rows[0];

            // Resolve Category
            const categoryPath = firstRow.categoryPath?.split('>').map((s: string) => s.trim()) || [];
            let parentId: string | undefined = undefined;
            let finalCategoryId: string | undefined = undefined;
            for (const catName of categoryPath) {
                let category = invProductCategories.find(c => c.name.toLowerCase() === catName.toLowerCase() && c.parentId === parentId);
                if (!category) {
                    const newCatId = uuidv4();
                    addCategory({ id: newCatId, name: catName, parentId: parentId });
                    category = { id: newCatId, name: catName, parentId: parentId };
                }
                parentId = category.id;
                finalCategoryId = category.id;
            }
            if (!finalCategoryId) {
                errors.push(`Product "${productName}": Category path "${firstRow.categoryPath}" is invalid.`);
                continue;
            }
            
            // Resolve Brand
            let brand = invBrands.find(b => b.name.toLowerCase() === firstRow.brandName?.toLowerCase());
            if (!brand && firstRow.brandName) {
                const newBrandId = uuidv4();
                addBrand({ id: newBrandId, name: firstRow.brandName });
                brand = { id: newBrandId, name: firstRow.brandName };
            }
            if(!brand) {
                errors.push(`Product "${productName}": Brand is required.`);
                continue;
            }

            // Resolve Model
            let model = invModels.find(m => m.name.toLowerCase() === firstRow.modelName?.toLowerCase() && m.brandId === brand.id);
            if (!model && firstRow.modelName) {
                const newModelId = uuidv4();
                addModel({ id: newModelId, name: firstRow.modelName, brandId: brand.id });
                model = { id: newModelId, name: firstRow.modelName, brandId: brand.id };
            }

            const variants: InventoryProductVariant[] = rows.map(row => {
                const sku = row.sku?.trim() || `${productName.slice(0,3).toUpperCase()}-${row.variantName?.slice(0,3).toUpperCase()}-${uuidv4().slice(0,4)}`;
                return {
                    id: uuidv4(),
                    name: row.variantName?.trim() || "Standard",
                    price: parseFloat(row.price),
                    sku: sku,
                    barcode: sku,
                    stock: 0,
                }
            });

            if (variants.some(v => isNaN(v.price))) {
                 errors.push(`Product "${productName}": One or more variants has an invalid price.`);
                 continue;
            }

            const newProduct: Omit<InventoryProduct, 'id'> = {
                name: productName,
                type: variants.length > 1 ? 'variant' : 'standard',
                categoryId: finalCategoryId,
                brandId: brand.id,
                modelId: model?.id,
                unit: firstRow.unit || 'Pcs',
                variants: variants,
            };

            addInvProduct(newProduct);
            itemsAddedCount++;
        }


        alert(`${itemsAddedCount} products (with variants) added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

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
    return <div>Loading products...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Filter Products</CardTitle>
                <CardDescription>Drill down into your inventory with specific filters.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download Format
                 </Button>
                 <Button asChild variant="outline" size="sm">
                    <Label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Upload Products
                        <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                    </Label>
                 </Button>
                <Button size="sm" onClick={() => handleOpenProductDialog(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select value={filterGroup} onValueChange={v => { setFilterGroup(v); setFilterCategory(''); setFilterSubCategory('');}}>
                    <SelectTrigger><SelectValue placeholder="Filter by Group"/></SelectTrigger>
                    <SelectContent>{groups.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setFilterSubCategory(''); }} disabled={!filterGroup}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category"/></SelectTrigger>
                    <SelectContent>{categories.filter(c => c.parentId === filterGroup).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterSubCategory} onValueChange={setFilterSubCategory} disabled={!filterCategory}>
                    <SelectTrigger><SelectValue placeholder="Filter by Sub-Category"/></SelectTrigger>
                    <SelectContent>{subCategories.filter(c => c.parentId === filterCategory).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={filterBrand} onValueChange={setFilterBrand}>
                    <SelectTrigger><SelectValue placeholder="Filter by Brand"/></SelectTrigger>
                    <SelectContent>{invBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterModel} onValueChange={setFilterModel} disabled={!filterBrand}>
                    <SelectTrigger><SelectValue placeholder="Filter by Model"/></SelectTrigger>
                    <SelectContent>{invModels.filter(m => m.brandId === filterBrand).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by Barcode/SKU" className="pl-8" value={filterBarcode} onChange={e => setFilterBarcode(e.target.value)} />
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button variant="outline" onClick={() => { setFilterGroup(''); setFilterCategory(''); setFilterSubCategory(''); setFilterBrand(''); setFilterModel(''); setFilterBarcode(''); }}>Reset Filters</Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 space-y-4">
           {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                    <Card key={product.id}>
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{product.name}</CardTitle>
                                    <CardDescription>
                                        {getCategoryPath(product.categoryId)} | {invBrands.find(b => b.id === product.brandId)?.name || 'No Brand'}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenProductDialog(product)} disabled>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteInvProduct(product.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-md">
                                {product.variants.map(variant => (
                                    <div key={variant.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                        <div>
                                            <p className="font-medium">{variant.name}</p>
                                            <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <Barcode value={variant.barcode} height={40} width={1.5} fontSize={12} />
                                            </div>
                                            <p className="text-lg font-bold w-24 text-right">৳{variant.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))
           ) : (
                <div className="text-center text-muted-foreground py-12 border rounded-lg">
                    No inventory products found matching your criteria.
                </div>
           )}
        </div>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Inventory Product'}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <form id="product-form-main" onSubmit={handleProductSubmit} className="space-y-4">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Product Type</Label>
                            <RadioGroup
                                defaultValue="standard"
                                className="grid grid-cols-3 gap-4"
                                value={productType}
                                onValueChange={(v: 'standard' | 'variant' | 'composite') => setProductType(v)}
                            >
                                <div>
                                    <RadioGroupItem value="standard" id="type-standard" className="peer sr-only" />
                                    <Label
                                    htmlFor="type-standard"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                    Standard
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="variant" id="type-variant" className="peer sr-only" />
                                    <Label
                                    htmlFor="type-variant"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                    Variant
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="composite" id="type-composite" className="peer sr-only" />
                                    <Label
                                    htmlFor="type-composite"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                    Composite
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productName">Product Name</Label>
                            <Input id="productName" name="productName" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Group</Label>
                                <div className="flex gap-1">
                                    <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={groupPopoverOpen} className="w-full justify-between">
                                                {selectedGroup ? groups.find(g => g.id === selectedGroup)?.name : "Select Group..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search group..." />
                                                <CommandList><CommandEmpty>No group found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {groups.map(group => (
                                                            <CommandItem key={group.id} value={group.name} onSelect={() => { setSelectedGroup(group.id); setSelectedCategory(''); setSelectedSubCategory(''); setGroupPopoverOpen(false); }}>{group.name}</CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button type="button" size="icon" variant="outline" onClick={() => handleOpenEntityDialog('Group')}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <div className="flex gap-1">
                                    <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={categoryPopoverOpen} className="w-full justify-between" disabled={!selectedGroup}>
                                                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Select Category..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search category..." />
                                                <CommandList><CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categories.filter(c => c.parentId === selectedGroup).map(category => (
                                                            <CommandItem key={category.id} value={category.name} onSelect={() => { setSelectedCategory(category.id); setSelectedSubCategory(''); setCategoryPopoverOpen(false); }}>{category.name}</CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button type="button" size="icon" variant="outline" onClick={() => handleOpenEntityDialog('Category', invProductCategories.find(c => c.id === selectedGroup))} disabled={!selectedGroup}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Sub-Category</Label>
                                <div className="flex gap-1">
                                    <Popover open={subCategoryPopoverOpen} onOpenChange={setSubCategoryPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={subCategoryPopoverOpen} className="w-full justify-between" disabled={!selectedCategory}>
                                                {selectedSubCategory ? subCategories.find(c => c.id === selectedSubCategory)?.name : "Select Sub-Category..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search sub-category..." />
                                                <CommandList><CommandEmpty>No sub-category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {subCategories.filter(c => c.parentId === selectedCategory).map(subCategory => (
                                                            <CommandItem key={subCategory.id} value={subCategory.name} onSelect={() => { setSelectedSubCategory(subCategory.id); setSubCategoryPopoverOpen(false); }}>{subCategory.name}</CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button type="button" size="icon" variant="outline" onClick={() => handleOpenEntityDialog('SubCategory', invProductCategories.find(c => c.id === selectedCategory))} disabled={!selectedCategory}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <div className="flex gap-1">
                                    <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={brandPopoverOpen} className="w-full justify-between" disabled={productType === 'composite'}>
                                                {selectedBrand ? invBrands.find(b => b.id === selectedBrand)?.name : "Select Brand..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search brand..." />
                                                <CommandList><CommandEmpty>No brand found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {invBrands.map(brand => (
                                                            <CommandItem key={brand.id} value={brand.name} onSelect={() => { setSelectedBrand(brand.id); setBrandPopoverOpen(false); }}>{brand.name}</CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button type="button" size="icon" variant="outline" onClick={() => handleOpenEntityDialog('Brand')}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <div className="flex gap-1">
                                    <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={modelPopoverOpen} className="w-full justify-between" disabled={!selectedBrand || productType === 'composite'}>
                                                {selectedModel ? invModels.find(m => m.id === selectedModel)?.name : "Select Model..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search model..." />
                                                <CommandList><CommandEmpty>No model found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {invModels.filter(m => m.brandId === selectedBrand).map(model => (
                                                            <CommandItem key={model.id} value={model.name} onSelect={() => { setSelectedModel(model.id); setModelPopoverOpen(false); }}>{model.name}</CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button type="button" size="icon" variant="outline" onClick={() => handleOpenEntityDialog('Model')} disabled={!selectedBrand}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input name="unit" placeholder="e.g., Pcs, Kg, Box" />
                            </div>
                        </div>

                        {(productType === 'standard' || productType === 'composite') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Sales Price</Label>
                                    <Input id="price" name="price" type="number" step="0.01" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU / Product Code</Label>
                                    <Input id="sku" name="sku" placeholder="Auto-generated if empty"/>
                                </div>
                            </div>
                        )}

                        {productType === 'variant' && (
                            <div className="border-t pt-4">
                                <Label className="text-base font-semibold">Product Attributes</Label>
                                <p className="text-sm text-muted-foreground mb-2">Select attributes and their values for this product.</p>
                                
                                <div className="space-y-3">
                                  {selectedAttributes.map((attr, index) => {
                                    const availableValues = attributeValues.filter(v => v.attributeId === attr.attributeId);
                                    return (
                                      <div key={attr.id} className="flex items-start gap-2">
                                          <div className="grid gap-1.5 w-1/3">
                                              <Label className="text-xs">Attribute</Label>
                                              <Select value={attr.attributeId} onValueChange={newId => handleAttributeSelectionChange(attr.id, newId)}>
                                                  <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                                  <SelectContent>
                                                    {definedAttributes.map(da => <SelectItem key={da.id} value={da.id}>{da.name}</SelectItem>)}
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                          <div className="grid gap-1.5 flex-grow">
                                              <Label className="text-xs">Values</Label>
                                              <div className="p-2 border rounded-md max-h-32 overflow-y-auto">
                                                  {availableValues.length > 0 ? (
                                                    availableValues.map(val => (
                                                      <div key={val.id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                          id={`val-${val.id}`}
                                                          checked={attr.values.includes(val.id)}
                                                          onCheckedChange={checked => handleValueSelectionChange(attr.id, val.id, !!checked)}
                                                        />
                                                        <label htmlFor={`val-${val.id}`} className="text-sm font-medium leading-none">{val.value}</label>
                                                      </div>
                                                    ))
                                                  ) : (
                                                    <p className="text-xs text-muted-foreground text-center">Select an attribute to see its values.</p>
                                                  )}
                                              </div>
                                          </div>
                                          <Button type="button" variant="ghost" size="icon" onClick={() => removeAttributeRow(attr.id)} disabled={selectedAttributes.length === 1} className="mt-6">
                                              <XCircle className="h-4 w-4 text-destructive" />
                                          </Button>
                                      </div>
                                    )
                                  })}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addAttributeRow} className="mt-2">+ Add Another Attribute</Button>
                            </div>
                        )}

                        {productType === 'composite' && (
                            <div className="border-t pt-4">
                                <Label className="text-base font-semibold">Composite Items</Label>
                                <p className="text-sm text-muted-foreground mb-2">Add the products that make up this bundle.</p>
                                <Popover open={compositePopoverOpen} onOpenChange={setCompositePopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="w-full justify-start">
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput 
                                                placeholder="Search for a product..." 
                                                value={compositeSearch}
                                                onValueChange={setCompositeSearch}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No product found.</CommandEmpty>
                                                <CommandGroup>
                                                {availableCompositeProducts.map(item => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={item.displayName}
                                                        onSelect={() => addCompositeItem(item.product, item.variant)}
                                                    >
                                                        {item.displayName}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                    {compositeItems.map(item => {
                                        const product = invProducts.find(p => p.id === item.productId);
                                        const variant = product?.variants.find(v => v.id === item.variantId);
                                        if (!product || !variant) return null;
                                        const displayName = product.variants.length > 1 ? `${product.name} (${variant.name})` : product.name;
                                        return (
                                            <div key={item.variantId} className="flex items-center justify-between p-2 rounded-md border">
                                                <span>{displayName}</span>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateCompositeItemQty(product.id, variant.id, -1)}>-</Button>
                                                    <span>{item.quantity}</span>
                                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateCompositeItemQty(product.id, variant.id, 1)}>+</Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {step === 2 && productType === 'variant' && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Generated Variants</h3>
                        <p className="text-sm text-muted-foreground">Review the generated variants and set their price and SKU suffix.</p>
                        
                        <div className="flex gap-2 p-2 border rounded-md bg-muted/50 items-end">
                          <div className="grid gap-1.5 flex-grow">
                              <Label htmlFor="apply-all-price" className="text-xs">Price for all</Label>
                              <Input id="apply-all-price" placeholder="e.g., 1200" type="number" value={applyAllPrice} onChange={e => setApplyAllPrice(e.target.value)} className="h-9"/>
                          </div>
                            <Button type="button" onClick={handleApplyPriceToAll}>Apply Price</Button>
                            <div className="grid gap-1.5 flex-grow">
                              <Label htmlFor="apply-all-sku" className="text-xs">SKU suffix for all</Label>
                              <Input id="apply-all-sku" placeholder="e.g., TSHIRT" value={applyAllSku} onChange={e => setApplyAllSku(e.target.value)} className="h-9"/>
                            </div>
                            <Button type="button" onClick={handleApplySkuToAll}>Apply SKU</Button>
                        </div>

                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                            {generatedVariants.map(variant => (
                                <div key={variant.id} className="grid grid-cols-[1fr,120px,150px] gap-2 items-center">
                                    <Input value={variant.name} readOnly className="bg-muted h-9"/>
                                    <Input 
                                        placeholder="Price" 
                                        type="number"
                                        step="0.01"
                                        value={variant.price || ''} 
                                        onChange={(e) => handleVariantDetailChange(variant.id!, 'price', parseFloat(e.target.value))}
                                        required
                                        className="h-9"
                                    />
                                    <Input 
                                        placeholder="SKU Suffix"
                                        value={variant.sku}
                                        onChange={(e) => handleVariantDetailChange(variant.id!, 'sku', e.target.value)}
                                        required
                                        className="h-9"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </form>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseProductDialog}>Cancel</Button>
              {(productType === 'standard' || productType === 'composite') && <Button type="submit" form="product-form-main">Save Product</Button>}
              {step === 1 && productType === 'variant' && <Button type="button" onClick={handleGenerateVariants}>Next: Generate Variants</Button>}
              {step === 2 && <Button type="button" onClick={() => setStep(1)}>Back</Button>}
              {step === 2 && <Button type="submit" form="product-form-main">Save Product & Variants</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={entityDialogOpen.isOpen} onOpenChange={(isOpen) => setEntityDialogOpen(prev => ({...prev, isOpen}))}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add New {entityDialogOpen.type}</DialogTitle>
                  {entityDialogOpen.parent && <DialogDescription>Adding under "{entityDialogOpen.parent.name}"</DialogDescription>}
              </DialogHeader>
              <form onSubmit={handleEntitySubmit}>
                  <div className="py-4 space-y-4">
                      {entityDialogOpen.type === 'Model' && (
                          <div className="space-y-2">
                            <Label>Brand</Label>
                            <Input value={invBrands.find(b => b.id === selectedBrand)?.name} readOnly disabled />
                            <input type="hidden" name="brandId" value={selectedBrand} />
                          </div>
                      )}
                      <div className="space-y-2">
                          <Label htmlFor="name">{entityDialogOpen.type} Name</Label>
                          <Input id="name" name="name" required autoFocus />
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setEntityDialogOpen({type: null, isOpen: false})}>Cancel</Button>
                      <Button type="submit">Create</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

    </>
  );
}
