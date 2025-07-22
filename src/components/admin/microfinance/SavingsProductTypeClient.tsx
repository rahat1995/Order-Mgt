

'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SavingsProductTypeClient() {
  const { settings, isLoaded } = useSettings();
  const { savingsProductTypes } = settings;

  if (!isLoaded) {
    return <div>Loading savings product types...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Core Savings Types</CardTitle>
          <CardDescription>These are the foundational savings types for your organization. They are hardcoded and cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Type Code</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {savingsProductTypes && savingsProductTypes.length > 0 ? (
                savingsProductTypes.map(type => (
                    <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{type.code}</TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                        No savings product types found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
