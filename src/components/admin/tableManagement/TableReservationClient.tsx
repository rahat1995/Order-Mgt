
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Square, Utensils } from 'lucide-react';
import type { Table, Floor } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';

const GRID_SIZE = 20;
const GRID_WIDTH_CELLS = 40;
const GRID_HEIGHT_CELLS = 30;

const landmarkOptions = [
    { name: 'Entrance', icon: Landmark },
    { name: 'Kitchen', icon: Utensils },
    { name: 'Restroom', icon: Landmark },
    { name: 'Bar', icon: Utensils },
    { name: 'Counter', icon: Landmark },
];

export function TableReservationClient() {
  const { settings, addReservation, deleteReservation, isLoaded } = useSettings();
  const { floors, tables, reservations, customers } = settings;
  
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(floors.length > 0 ? floors[0].id : null);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [partySize, setPartySize] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setReservationDialogOpen(true);
    // Reset form
    setSelectedCustomerId('');
    setReservationDate('');
    setReservationTime('');
    setPartySize('');
  };

  const handleReservationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTable || !selectedCustomerId || !reservationDate || !reservationTime) {
        alert("Please fill all fields.");
        return;
    }
    addReservation({
        tableId: selectedTable.id,
        customerId: selectedCustomerId,
        dateTime: `${reservationDate}T${reservationTime}`,
        partySize: parseInt(partySize) || 1,
    });
    setReservationDialogOpen(false);
  };
  
  const handleDeleteReservation = (reservationId: string) => {
      if (window.confirm("Are you sure you want to cancel this reservation?")) {
        deleteReservation(reservationId);
      }
  }

  const getTableStatus = (tableId: string) => {
      const now = new Date();
      const reservation = reservations.find(r => {
          if (r.tableId !== tableId) return false;
          const resTime = new Date(r.dateTime);
          // Assuming a 2-hour window for reservations
          const resEndTime = new Date(resTime.getTime() + 2 * 60 * 60 * 1000);
          return now >= resTime && now <= resEndTime;
      });
      return reservation ? { status: 'occupied', reservation } : { status: 'available', reservation: null };
  }

  const floorTables = tables.filter(t => t.floorId === selectedFloorId && t.x >= 0 && t.y >= 0);

  if (!isLoaded) {
    return <div>Loading layout...</div>;
  }

  return (
    <>
      <Card>
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
            {floorTables.map(item => {
              if (item.itemType === 'landmark') {
                  const Icon = landmarkOptions.find(opt => opt.name === item.name)?.icon || Square;
                  return (
                    <div
                        key={item.id}
                        style={{ left: `${item.x * GRID_SIZE}px`, top: `${item.y * GRID_SIZE}px` }}
                        className="absolute flex flex-col items-center justify-center p-2 rounded-md bg-secondary text-secondary-foreground shadow-md w-24 h-16"
                    >
                        <Icon className="h-6 w-6 mb-1" />
                        <span className="font-semibold text-xs">{item.name}</span>
                    </div>
                  );
              }
              
              const { status } = getTableStatus(item.id);

              return (
                  <div
                      key={item.id}
                      onClick={() => handleTableClick(item)}
                      style={{ left: `${item.x * GRID_SIZE}px`, top: `${item.y * GRID_SIZE}px` }}
                      className={cn(
                          "absolute flex items-center justify-center p-2 rounded-md cursor-pointer transition-all shadow-lg",
                          item.shape === 'round' ? 'rounded-full w-16 h-16' : 'w-20 h-12',
                          status === 'available' && 'bg-green-500 hover:bg-green-600 text-white',
                          status === 'occupied' && 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
                      )}
                  >
                      <span className="font-bold text-sm">{item.name}</span>
                  </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
       <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table: {selectedTable?.name}</DialogTitle>
            <DialogDescription>
              Book this table or manage its current reservation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTable && getTableStatus(selectedTable.id).status === 'occupied' ? (
              <div className="py-4">
                  <h3 className="font-semibold mb-2">Current Reservation</h3>
                  <div className="p-4 border rounded-md bg-muted/50 text-sm space-y-1">
                      <p><strong>Customer:</strong> {customers.find(c => c.id === getTableStatus(selectedTable.id).reservation?.customerId)?.name}</p>
                      <p><strong>Time:</strong> {new Date(getTableStatus(selectedTable.id).reservation!.dateTime).toLocaleString()}</p>
                      <p><strong>Party Size:</strong> {getTableStatus(selectedTable.id).reservation?.partySize}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4" 
                    onClick={() => handleDeleteReservation(getTableStatus(selectedTable.id).reservation!.id)}
                  >
                    Cancel Reservation
                  </Button>
              </div>
          ) : (
            <form onSubmit={handleReservationSubmit}>
                <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Customer</Label>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : "Select customer..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search customer..."/>
                                <CommandList>
                                <CommandEmpty>No customer found.</CommandEmpty>
                                <CommandGroup>
                                    {customers.map(customer => (
                                    <CommandItem
                                        key={customer.id}
                                        value={`${customer.name} ${customer.mobile}`}
                                        onSelect={() => {
                                            setSelectedCustomerId(customer.id);
                                            setPopoverOpen(false);
                                        }}
                                    >
                                        {customer.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={reservationDate} onChange={e => setReservationDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" type="time" value={reservationTime} onChange={e => setReservationTime(e.target.value)} required />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="partySize">Party Size</Label>
                    <Input id="partySize" type="number" value={partySize} onChange={e => setPartySize(e.target.value)} />
                </div>
                </div>
                <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReservationDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Confirm Reservation</Button>
                </DialogFooter>
            </form>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
