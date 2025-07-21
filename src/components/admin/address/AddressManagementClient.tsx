
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Division, District, Upozilla, Union, Village, WorkingArea } from '@/types';
import * as XLSX from 'xlsx';

type EntityType = 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea';
type Entity = Division | District | Upozilla | Union | Village | WorkingArea;

const entityConfig: Record<EntityType, { title: string; parent?: EntityType }> = {
    'Division': { title: 'Divisions' },
    'District': { title: 'Districts', parent: 'Division' },
    'Upozilla': { title: 'Upozillas', parent: 'District' },
    'Union': { title: 'Unions', parent: 'Upozilla' },
    'Village': { title: 'Villages', parent: 'Union' },
    'WorkingArea': { title: 'Working Areas' },
};

const ITEMS_PER_PAGE = 20;

const HierarchicalParentSelector = ({ entityType, onParentSelect, defaultParentId }: { entityType: EntityType, onParentSelect: (parentId: string) => void, defaultParentId?: string }) => {
    const { settings } = useSettings();
    const { divisions, districts, upozillas, unions } = settings;

    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedUpozilla, setSelectedUpozilla] = useState('');
    const [selectedUnion, setSelectedUnion] = useState('');

    useEffect(() => {
        if(defaultParentId && entityType) {
            // Pre-fill selectors if editing
            if (entityType === 'Village') {
                const parentUnion = unions.find(u => u.id === defaultParentId);
                const parentUpozilla = upozillas.find(u => u.id === parentUnion?.parentId);
                const parentDistrict = districts.find(d => d.id === parentUpozilla?.parentId);
                const parentDivision = divisions.find(d => d.id === parentDistrict?.parentId);
                if (parentDivision) setSelectedDivision(parentDivision.id);
                if (parentDistrict) setSelectedDistrict(parentDistrict.id);
                if (parentUpozilla) setSelectedUpozilla(parentUpozilla.id);
                if (parentUnion) setSelectedUnion(parentUnion.id);
            }
            // Add similar logic for other types if needed...
        }
    }, [defaultParentId, entityType, divisions, districts, upozillas, unions]);


    if (!entityConfig[entityType].parent) return null;
    
    const selectors = [];

    if (['District', 'Upozilla', 'Union', 'Village'].includes(entityType)) {
        selectors.push(
            <div key="division-selector" className="space-y-2">
                <Label>Division</Label>
                <Select value={selectedDivision} onValueChange={v => { setSelectedDivision(v); setSelectedDistrict(''); setSelectedUpozilla(''); setSelectedUnion(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                    <SelectContent>{divisions.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        );
    }

    if (['Upozilla', 'Union', 'Village'].includes(entityType)) {
        selectors.push(
            <div key="district-selector" className="space-y-2">
                <Label>District</Label>
                <Select value={selectedDistrict} onValueChange={v => { setSelectedDistrict(v); setSelectedUpozilla(''); setSelectedUnion(''); }} disabled={!selectedDivision}>
                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent>{districts.filter(d => d.parentId === selectedDivision).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        );
    }
    
     if (['Union', 'Village'].includes(entityType)) {
        selectors.push(
            <div key="upozilla-selector" className="space-y-2">
                <Label>Upozilla</Label>
                <Select value={selectedUpozilla} onValueChange={v => { setSelectedUpozilla(v); setSelectedUnion(''); }} disabled={!selectedDistrict}>
                    <SelectTrigger><SelectValue placeholder="Select Upozilla" /></SelectTrigger>
                    <SelectContent>{upozillas.filter(u => u.parentId === selectedDistrict).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        );
    }

    if (['Village'].includes(entityType)) {
        selectors.push(
            <div key="union-selector" className="space-y-2">
                <Label>Union</Label>
                <Select name="parentId" value={selectedUnion} onValueChange={v => { setSelectedUnion(v); onParentSelect(v); }} disabled={!selectedUpozilla}>
                    <SelectTrigger><SelectValue placeholder="Select Union" /></SelectTrigger>
                    <SelectContent>{unions.filter(u => u.parentId === selectedUpozilla).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        );
    } else if (entityType === 'Union') {
         selectors[selectors.length - 1] = React.cloneElement(selectors[selectors.length - 1], {
            children: React.cloneElement(selectors[selectors.length-1].props.children, { name: 'parentId', onValueChange: (v: string) => { setSelectedUpozilla(v); onParentSelect(v); }})
        });
    } else if (entityType === 'Upozilla') {
         selectors[selectors.length - 1] = React.cloneElement(selectors[selectors.length - 1], {
            children: React.cloneElement(selectors[selectors.length-1].props.children, { name: 'parentId', onValueChange: (v: string) => { setSelectedDistrict(v); onParentSelect(v); }})
        });
    } else if (entityType === 'District') {
         selectors[selectors.length - 1] = React.cloneElement(selectors[selectors.length - 1], {
            children: React.cloneElement(selectors[selectors.length-1].props.children, { name: 'parentId', onValueChange: (v: string) => { setSelectedDivision(v); onParentSelect(v); }})
        });
    }

    return <div className="space-y-4">{selectors}</div>;
}


function ManagementPanel({ entityType }: { entityType: EntityType }) {
    const { settings, addAddressData, updateAddressData, deleteAddressData, isLoaded } = useSettings();
    const { divisions, districts, upozillas, unions, villages } = settings;
    const config = entityConfig[entityType];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
    const [selectedParentId, setSelectedParentId] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    
    // State for hierarchical filters
    const [filterDivision, setFilterDivision] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [filterUpozilla, setFilterUpozilla] = useState('');
    const [filterUnion, setFilterUnion] = useState('');

    const getEntityData = () => {
        switch(entityType) {
            case 'Division': return settings.divisions;
            case 'District': return settings.districts;
            case 'Upozilla': return settings.upozillas;
            case 'Union': return settings.unions;
            case 'Village': return settings.villages;
            case 'WorkingArea': return settings.workingAreas;
        }
    }
    
    const getParentData = (type?: EntityType) => {
        const parentType = type || config.parent;
        if (!parentType) return [];
        switch(parentType) {
            case 'Division': return settings.divisions;
            case 'District': return settings.districts;
            case 'Upozilla': return settings.upozillas;
            case 'Union': return settings.unions;
            case 'Village': return settings.villages;
            default: return [];
        }
    }

    const parentData = getParentData();
    
    const filteredData = useMemo(() => {
        let data = getEntityData();

        if (entityType === 'District' && filterDivision) {
            data = (data as District[]).filter(d => d.parentId === filterDivision);
        } else if (entityType === 'Upozilla' && filterDistrict) {
            data = (data as Upozilla[]).filter(u => u.parentId === filterDistrict);
        } else if (entityType === 'Union' && filterUpozilla) {
            data = (data as Union[]).filter(u => u.parentId === filterUpozilla);
        } else if (entityType === 'Village' && filterUnion) {
            data = (data as Village[]).filter(v => v.parentId === filterUnion);
        }
        
        return data.sort((a,b) => a.name.localeCompare(b.name));
    }, [entityType, settings, filterDivision, filterDistrict, filterUpozilla, filterUnion]);
    
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage]);
    
    const getFullPath = (item: any): string => {
        if (!config.parent) return item.name;

        let path: string[] = [item.name];
        let currentItem = item;
        let currentParentType = config.parent;
        
        while (currentParentType) {
            const parentList = getParentData(currentParentType) as any[];
            const parent = parentList.find(p => p.id === currentItem.parentId);
            if (parent) {
                path.unshift(parent.name);
                currentItem = parent;
                const grandParentType = Object.values(entityConfig).find(c => c.title === `${currentParentType}s`)?.parent;
                currentParentType = grandParentType as EntityType;
            } else {
                break;
            }
        }
        return path.join(' > ');
    }


    const handleOpenDialog = (entity: Entity | null) => {
        setEditingEntity(entity);
        if (entity && 'parentId' in entity) {
            setSelectedParentId(entity.parentId);
        } else {
            setSelectedParentId('');
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingEntity(null);
        setDialogOpen(false);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const id = formData.get('id') as string;

        if (config.parent) {
            if (!selectedParentId) {
                alert(`Please select a parent ${config.parent}.`);
                return;
            }
        }
        
        if (!name || (editingEntity === null && !id)) {
            alert('ID and Name are required.');
            return;
        }
        
        let entityData: any = { name, id: editingEntity ? editingEntity.id : id };
        if (selectedParentId) entityData.parentId = selectedParentId;

        if (editingEntity) {
            updateAddressData(entityType, entityData);
        } else {
            addAddressData(entityType, entityData);
        }
        handleCloseDialog();
    };

    const handleDownloadFormat = () => {
        const headers = ["id", "name"];
        if (config.parent) headers.push("parentId");
        
        const ws = XLSX.utils.json_to_sheet([], { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, config.title);
        XLSX.writeFile(wb, `${entityType.toLowerCase()}_format.xlsx`);
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
                const { id, name, parentId } = row;

                if (!id || !name) {
                    errors.push(`Row ${index + 2}: Missing required fields (id, name).`);
                    return;
                }
                
                if (config.parent && !parentId) {
                    errors.push(`Row ${index + 2}: Missing required field (parentId).`);
                    return;
                }
                
                let entityData: any = { id: String(id), name: String(name) };
                if (parentId) entityData.parentId = String(parentId);

                addAddressData(entityType, entityData);
                itemsAdded++;
            });

            alert(`${itemsAdded} ${config.title.toLowerCase()} added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

        } catch (error) {
            console.error("Error processing file:", error);
            alert("Failed to process the uploaded file. Please ensure it is a valid Excel file.");
        } finally {
            event.target.value = '';
        }
        };
        reader.readAsArrayBuffer(file);
    };
    
    const renderFilters = () => {
        const filters: JSX.Element[] = [];

        if (['District', 'Upozilla', 'Union', 'Village', 'WorkingArea'].includes(entityType)) {
            filters.push(
                <div key="division" className="space-y-1">
                    <Label>Division</Label>
                    <Select value={filterDivision} onValueChange={(v) => { setFilterDivision(v); setFilterDistrict(''); setFilterUpozilla(''); setFilterUnion(''); setCurrentPage(1); }}>
                        <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                        <SelectContent>{divisions.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            );
        }
        if (['Upozilla', 'Union', 'Village', 'WorkingArea'].includes(entityType)) {
            filters.push(
                <div key="district" className="space-y-1">
                    <Label>District</Label>
                    <Select value={filterDistrict} onValueChange={(v) => { setFilterDistrict(v); setFilterUpozilla(''); setFilterUnion(''); setCurrentPage(1); }} disabled={!filterDivision}>
                        <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                        <SelectContent>{districts.filter(d => d.parentId === filterDivision).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            );
        }
        if (['Union', 'Village', 'WorkingArea'].includes(entityType)) {
            filters.push(
                <div key="upozilla" className="space-y-1">
                    <Label>Upozilla</Label>
                    <Select value={filterUpozilla} onValueChange={(v) => { setFilterUpozilla(v); setFilterUnion(''); setCurrentPage(1); }} disabled={!filterDistrict}>
                        <SelectTrigger><SelectValue placeholder="Select Upozilla" /></SelectTrigger>
                        <SelectContent>{upozillas.filter(u => u.parentId === filterDistrict).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            );
        }
        if (['Village', 'WorkingArea'].includes(entityType)) {
            filters.push(
                <div key="union" className="space-y-1">
                    <Label>Union</Label>
                    <Select value={filterUnion} onValueChange={(v) => {setFilterUnion(v); setCurrentPage(1); }} disabled={!filterUpozilla}>
                        <SelectTrigger><SelectValue placeholder="Select Union" /></SelectTrigger>
                        <SelectContent>{unions.filter(u => u.parentId === filterUpozilla).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            );
        }

        return filters.length > 0 ? (
            <div className="mb-4 p-4 border rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                {filters}
            </div>
        ) : null;
    }

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{config.title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleDownloadFormat} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Format</Button>
                        <Button asChild variant="outline" size="sm">
                            <Label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" /> Upload<Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} /></Label>
                        </Button>
                        <Button onClick={() => handleOpenDialog(null)} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderFilters()}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            {config.parent && <TableHead>Full Path</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? paginatedData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell className="font-semibold">{item.name}</TableCell>
                                {config.parent && <TableCell className="text-sm text-muted-foreground">{getFullPath(item)}</TableCell>}
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAddressData(entityType, item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={config.parent ? 4 : 3} className="h-24 text-center">No {config.title.toLowerCase()} found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    Showing {paginatedData.length} of {filteredData.length} entries.
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardFooter>
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingEntity ? 'Edit' : 'Add'} {config.title.slice(0, -1)}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="id">ID</Label>
                            <Input id="id" name="id" defaultValue={editingEntity?.id} required disabled={!!editingEntity} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={editingEntity?.name} required />
                        </div>
                         {config.parent && (
                            <div className="space-y-2">
                                <Label>Parent {config.parent}</Label>
                                <HierarchicalParentSelector 
                                    entityType={entityType} 
                                    onParentSelect={setSelectedParentId}
                                    defaultParentId={(editingEntity as any)?.parentId}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                    <Button type="submit">{editingEntity ? 'Save Changes' : 'Create'}</Button>
                    </DialogFooter>
                </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export function AddressManagementClient() {
  return (
    <Tabs defaultValue="Division" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {Object.keys(entityConfig).map(key => (
          <TabsTrigger key={key} value={key}>{entityConfig[key as EntityType].title}</TabsTrigger>
        ))}
      </TabsList>
       {Object.keys(entityConfig).map(key => (
          <TabsContent key={key} value={key}>
              <ManagementPanel entityType={key as EntityType} />
          </TabsContent>
        ))}
    </Tabs>
  );
}
