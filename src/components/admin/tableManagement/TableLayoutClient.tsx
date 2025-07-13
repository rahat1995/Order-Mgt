
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, Plus, Square, Trash, Utensils, X, Move, Eraser } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Table, Floor } from '@/types';
import { cn } from '@/lib/utils';


const GRID_SIZE = 20;
const GRID_WIDTH_CELLS = 40;
const GRID_HEIGHT_CELLS = 30;

const landmarkIcons = {
    Landmark,
    Utensils,
    Square,
};
type LandmarkIconName = keyof typeof landmarkIcons;
const landmarkIconNames = Object.keys(landmarkIcons) as LandmarkIconName[];


export function TableLayoutClient() {
  const { settings, updateTable, addTable, deleteTable, addFloor, isLoaded } = useSettings();
  const { floors, tables } = settings;
  
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(floors.length > 0 ? floors[0].id : null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [landmarkDialogOpen, setLandmarkDialogOpen] = useState(false);
  const [floorDialogOpen, setFloorDialogOpen] = useState(false);

  const [movingItem, setMovingItem] = useState<Table | null>(null);

  const lastAddedFloorId = useRef<string | null>(null);

  useEffect(() => {
    if (isLoaded && floors.length > 0 && !selectedFloorId) {
        setSelectedFloorId(floors[0].id);
    }
  }, [isLoaded, floors, selectedFloorId]);

  useEffect(() => {
    if (lastAddedFloorId.current) {
      setSelectedFloorId(lastAddedFloorId.current);
      lastAddedFloorId.current = null;
    }
  }, [floors]);


  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!movingItem) return;

    const gridRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;

    let newX = Math.floor(x / GRID_SIZE);
    let newY = Math.floor(y / GRID_SIZE);

    const itemWidth = movingItem.itemType === 'landmark' ? 6 : (movingItem.shape === 'round' ? 4 : 5);
    const itemHeight = movingItem.itemType === 'landmark' ? 4 : (movingItem.shape === 'round' ? 4 : 3);

    newX = Math.max(0, Math.min(newX, GRID_WIDTH_CELLS - itemWidth));
    newY = Math.max(0, Math.min(newY, GRID_HEIGHT_CELLS - itemHeight));
    
    updateTable({ ...movingItem, x: newX, y: newY, floorId: selectedFloorId! });
    setMovingItem(null);
  };

  const handleItemClick = (item: Table) => {
    if (movingItem?.id === item.id) {
      setMovingItem(null); // Deselect if clicking the same item
    } else {
      setMovingItem(item); // Select item to move
    }
  };

  const handleTableFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const shape = formData.get('shape') as 'rectangle' | 'round';
    if (!name || !selectedFloorId) return;

    addTable({ name, shape, floorId: selectedFloorId, itemType: 'table' });
    setTableDialogOpen(false);
  };

  const handleLandmarkFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as LandmarkIconName;
    if (!name || !icon || !selectedFloorId) return;

    addTable({ name, shape: 'rectangle', floorId: selectedFloorId, itemType: 'landmark', icon });
    setLandmarkDialogOpen(false);
  }
  
  const handleDeleteItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item? This cannot be undone.")) {
        deleteTable(id);
    }
  }

  const handleFloorFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;
    const newFloor = addFloor({ name });
    lastAddedFloorId.current = newFloor.id;
    setFloorDialogOpen(false);
  }
  
  const returnToSidebar = (item: Table) => {
      updateTable({ ...item, x: -1, y: -1 });
      setMovingItem(null);
  }

  const floorItems = tables.filter(t => t.floorId === selectedFloorId && t.x >= 0 && t.y >= 0);
  const sidebarItems = tables.filter(t => t.floorId === selectedFloorId && (t.x < 0 || t.y < 0));

  const sidebarTables = sidebarItems.filter(i => i.itemType === 'table');
  const sidebarLandmarks = sidebarItems.filter(i => i.itemType === 'landmark');

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
             <div className="flex items-center gap-2">
                <Select value={selectedFloorId || ''} onValueChange={setSelectedFloorId}>
                    <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select a floor" />
                    </SelectTrigger>
                    <SelectContent>
                        {floors.map(floor => (
                            <SelectItem key={floor.id} value={floor.id}>{floor.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setFloorDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                </Button>
             </div>
          </CardHeader>
          <CardContent>
            {movingItem && (
                <div className="p-2 mb-4 text-center bg-blue-100 border border-blue-300 rounded-md text-blue-800 flex items-center justify-center">
                    <p>Placing: <span className="font-bold">{movingItem.name}</span>. Click on the grid to place it.</p>
                </div>
            )}
            <div
              onClick={handleGridClick}
              className={cn(
                "relative bg-muted/30 rounded-lg overflow-hidden border",
                movingItem && "cursor-copy"
              )}
              style={{ width: `${GRID_WIDTH_CELLS * GRID_SIZE}px`, height: `${GRID_HEIGHT_CELLS * GRID_SIZE}px` }}
            >
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="smallGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />
              </svg>
              {floorItems.map(item => {
                const Icon = item.icon ? landmarkIcons[item.icon] : Square;
                return (
                    <div
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                        style={{
                            left: `${item.x * GRID_SIZE}px`,
                            top: `${item.y * GRID_SIZE}px`,
                            width: item.itemType === 'landmark' ? '120px' : (item.shape === 'round' ? '80px' : '100px'),
                            height: item.itemType === 'landmark' ? '80px' : (item.shape === 'round' ? '80px' : '60px'),
                        }}
                        className={cn(
                            "absolute flex items-center justify-center p-2 cursor-pointer transition-all shadow-lg",
                            item.shape === 'round' ? 'rounded-full' : 'rounded-md',
                            item.itemType === 'table' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground flex-col',
                            movingItem?.id === item.id && "ring-4 ring-offset-2 ring-blue-500"
                        )}
                    >
                        {item.itemType === 'landmark' && <Icon className="h-6 w-6 mb-1" />}
                        <span className="font-bold text-sm">{item.name}</span>

                        {/* Action buttons on hover */}
                         <div className="absolute -top-3 -right-3 flex opacity-0 hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full z-10" onClick={(e) => {e.stopPropagation(); returnToSidebar(item); }}>
                                <Eraser className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 self-start sticky top-6">
          <CardHeader>
            <CardTitle>Layout Items</CardTitle>
            <CardDescription>Click an item to select it, then click on the grid to place it.</CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="tables">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tables">Tables</TabsTrigger>
                    <TabsTrigger value="landmarks">Landmarks</TabsTrigger>
                </TabsList>
                <TabsContent value="tables" className="mt-4 space-y-2">
                    <Button onClick={() => setTableDialogOpen(true)} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add New Table
                    </Button>
                    <div className="space-y-2 pt-2 border-t max-h-96 overflow-y-auto">
                        {sidebarTables.map(table => (
                            <div key={table.id} className="flex items-center gap-2">
                                <div 
                                    onClick={() => handleItemClick(table)}
                                    className={cn(
                                        "flex-grow flex items-center justify-center p-2 rounded-md cursor-pointer border bg-card hover:bg-muted",
                                        table.shape === 'round' ? 'rounded-full h-16' : 'h-12',
                                        movingItem?.id === table.id && 'ring-2 ring-blue-500'
                                    )}
                                >
                                    <span className="font-bold text-sm">{table.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(table.id)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {sidebarTables.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">No unplaced tables.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="landmarks" className="mt-4 space-y-2">
                     <Button onClick={() => setLandmarkDialogOpen(true)} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add New Landmark
                    </Button>
                     <div className="space-y-2 pt-2 border-t max-h-96 overflow-y-auto">
                        {sidebarLandmarks.map(landmark => {
                            const Icon = landmark.icon ? landmarkIcons[landmark.icon] : Square;
                            return(
                                <div key={landmark.id} className="flex items-center gap-2">
                                    <div
                                        onClick={() => handleItemClick(landmark)}
                                        className={cn(
                                            "flex-grow flex flex-col items-center justify-center p-2 rounded-md cursor-pointer border bg-card hover:bg-muted h-20",
                                            movingItem?.id === landmark.id && 'ring-2 ring-blue-500'
                                        )}
                                    >
                                        <Icon className="h-6 w-6 mb-1 text-muted-foreground" />
                                        <span className="font-semibold text-xs">{landmark.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(landmark.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                         {sidebarLandmarks.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">No unplaced landmarks.</p>}
                    </div>
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

       <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              This table will be added to the sidebar for the current floor ({floors.find(f => f.id === selectedFloorId)?.name}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTableFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Table Name / Number</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shape">Shape</Label>
                <Select name="shape" defaultValue="rectangle">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rectangle">Rectangle</SelectItem>
                        <SelectItem value="round">Round</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTableDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Table</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={landmarkDialogOpen} onOpenChange={setLandmarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Landmark</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLandmarkFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Landmark Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select name="icon" defaultValue={landmarkIconNames[0]}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {landmarkIconNames.map(iconName => {
                            const Icon = landmarkIcons[iconName];
                            return (
                                <SelectItem key={iconName} value={iconName}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{iconName}</span>
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLandmarkDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Landmark</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={floorDialogOpen} onOpenChange={setFloorDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Floor</DialogTitle></DialogHeader>
          <form onSubmit={handleFloorFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Floor Name</Label>
                <Input id="name" name="name" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFloorDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Floor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
