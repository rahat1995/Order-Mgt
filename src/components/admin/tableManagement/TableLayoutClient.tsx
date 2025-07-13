
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, Plus, Square, Trash, Utensils } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Table, Floor } from '@/types';
import { cn } from '@/lib/utils';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const GRID_SIZE = 20;
const GRID_WIDTH_CELLS = 40;
const GRID_HEIGHT_CELLS = 30;

const ItemTypes = {
  TABLE: 'table',
  LANDMARK: 'landmark',
};

const landmarkOptions = [
    { name: 'Entrance', icon: Landmark },
    { name: 'Kitchen', icon: Utensils },
    { name: 'Restroom', icon: Landmark },
    { name: 'Bar', icon: Utensils },
    { name: 'Counter', icon: Landmark },
];

const DraggableItem = ({ item, type }: { item: Table, type: 'sidebar' | 'grid' }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TABLE,
    item: { id: item.id, type: ItemTypes.TABLE },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item.id]);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        left: type === 'grid' ? `${item.x * GRID_SIZE}px` : undefined,
        top: type === 'grid' ? `${item.y * GRID_SIZE}px` : undefined,
      }}
      className={cn(
        "flex items-center justify-center p-2 rounded-md cursor-grab transition-all",
        type === 'sidebar' ? "border bg-card hover:bg-muted" : "absolute bg-primary text-primary-foreground shadow-lg",
        item.shape === 'round' ? 'rounded-full w-16 h-16' : 'w-20 h-12',
      )}
    >
      <span className="font-bold text-sm">{item.name}</span>
    </div>
  );
};

const DraggableLandmark = ({ landmark, type }: { landmark: Table, type: 'sidebar' | 'grid' }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.LANDMARK,
    item: { id: landmark.id, type: ItemTypes.LANDMARK },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [landmark.id]);
  
  const Icon = landmarkOptions.find(opt => opt.name === landmark.name)?.icon || Square;

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        left: type === 'grid' ? `${landmark.x * GRID_SIZE}px` : undefined,
        top: type === 'grid' ? `${landmark.y * GRID_SIZE}px` : undefined,
      }}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-md cursor-grab transition-all text-muted-foreground",
        type === 'sidebar' ? "border bg-card hover:bg-muted" : "absolute bg-secondary text-secondary-foreground shadow-md",
        "w-24 h-16"
      )}
    >
      <Icon className="h-6 w-6 mb-1" />
      <span className="font-semibold text-xs">{landmark.name}</span>
    </div>
  );
};

export function TableLayoutClient() {
  const { settings, updateTable, addTable, deleteTable, isLoaded } = useSettings();
  const { floors, tables } = settings;
  
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(floors.length > 0 ? floors[0].id : null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const lastAddedRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastAddedRef.current) {
      const table = tables.find(t => t.id === lastAddedRef.current);
      if (table && table.floorId === selectedFloorId) {
        // This is a new table on the current floor, but not yet placed.
        // It will appear in the sidebar.
      }
      lastAddedRef.current = null;
    }
  }, [tables, selectedFloorId]);

  const handleDrop = (item: { id: string, type: string }, monitor: any) => {
    const delta = monitor.getDifferenceFromInitialOffset();
    const currentTable = tables.find(t => t.id === item.id);
    
    if (!currentTable) return;
    
    let newX = Math.round((currentTable.x * GRID_SIZE + delta.x) / GRID_SIZE);
    let newY = Math.round((currentTable.y * GRID_SIZE + delta.y) / GRID_SIZE);
    
    newX = Math.max(0, Math.min(newX, GRID_WIDTH_CELLS - (currentTable.shape === 'round' ? 4 : 5)));
    newY = Math.max(0, Math.min(newY, GRID_HEIGHT_CELLS - (currentTable.shape === 'round' ? 4 : 3)));
    
    updateTable({ ...currentTable, x: newX, y: newY, floorId: selectedFloorId! });
  };
  
  const [, drop] = useDrop(() => ({
    accept: [ItemTypes.TABLE, ItemTypes.LANDMARK],
    drop: (item, monitor) => handleDrop(item, monitor),
  }));

  const handleTableFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const shape = formData.get('shape') as 'rectangle' | 'round';
    if (!name || !selectedFloorId) return;

    const newTable = addTable({ name, shape, floorId: selectedFloorId });
    lastAddedRef.current = newTable.id;
    setTableDialogOpen(false);
  };
  
  const handleDeleteFromGrid = (id: string) => {
    if (window.confirm("Are you sure you want to delete this table? This cannot be undone.")) {
        deleteTable(id);
    }
  }

  const floorTables = tables.filter(t => t.floorId === selectedFloorId && t.x >= 0 && t.y >= 0);
  const sidebarTables = tables.filter(t => t.floorId === selectedFloorId && (t.x < 0 || t.y < 0));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
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
          </CardHeader>
          <CardContent>
            <div
              ref={drop}
              className="relative bg-muted/30 rounded-lg overflow-hidden border"
              style={{ width: `${GRID_WIDTH_CELLS * GRID_SIZE}px`, height: `${GRID_HEIGHT_CELLS * GRID_SIZE}px` }}
            >
              {/* Grid background */}
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="smallGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />
              </svg>
              {/* Placed items */}
              {floorTables.map(item => (
                item.itemType === 'landmark' 
                  ? <DraggableLandmark key={item.id} landmark={item} type="grid" />
                  : <DraggableItem key={item.id} item={item} type="grid" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 self-start sticky top-6">
          <CardHeader>
            <CardTitle>Layout Items</CardTitle>
            <CardDescription>Drag items onto the floor plan.</CardDescription>
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
                                <DraggableItem item={table} type="sidebar" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteFromGrid(table.id)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         {sidebarTables.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">No unplaced tables.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="landmarks" className="mt-4 space-y-2">
                     <div className="space-y-2 pt-2 max-h-96 overflow-y-auto">
                        {landmarkOptions.map(landmark => (
                             <DraggableLandmark key={landmark.name} landmark={{id: landmark.name, name: landmark.name, itemType: 'landmark', floorId: selectedFloorId!, x: -1, y: -1, shape: 'rectangle'}} type="sidebar" />
                        ))}
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
    </DndProvider>
  );
}
