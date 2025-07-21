
'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AssetListClient() {
  const { settings, isLoaded } = useSettings();
  const { fixedAssets, assetLocations, employees, designations } = settings;

  if (!isLoaded) {
    return <div>Loading assets...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Assets</CardTitle>
        <CardDescription>
          A list of all fixed assets in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead className="text-right">Purchase Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Issued To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixedAssets.length > 0 ? (
              fixedAssets.map((asset) => {
                const location = assetLocations.find(l => l.id === asset.locationId);
                const employee = employees.find(e => e.id === asset.employeeId);
                const designation = employee ? designations.find(d => d.id === employee.designationId) : null;
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{new Date(asset.purchaseDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">৳{asset.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell>{location?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {employee ? (
                        <div>
                          <p>{employee.name}</p>
                          {designation && <p className="text-xs text-muted-foreground">{designation.name}</p>}
                        </div>
                      ) : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No assets registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
