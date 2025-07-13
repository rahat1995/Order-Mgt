
'use client';
import { TableLayoutClient } from '@/components/admin/tableManagement/TableLayoutClient';
import { useSettings } from '@/context/SettingsContext';
import { Map } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function ConfigureTableLayoutPage() {
  const { settings: { floors }, isLoaded } = useSettings();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (floors.length === 0) {
    return (
        <div className="text-center p-8 border rounded-lg">
            <h2 className="text-2xl font-bold">No Floors Found</h2>
            <p className="text-muted-foreground mt-2">Please add a floor in the "Manage Floors" section before configuring a layout.</p>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Map className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Configure Table Layout</h1>
        </div>
        <p className="text-muted-foreground">
          Select a floor, then drag and drop tables and landmarks from the sidebar onto the grid to match your restaurant's layout.
        </p>
        <div className="h-[1px] w-full bg-border" />
        <TableLayoutClient />
      </div>
  );
}
