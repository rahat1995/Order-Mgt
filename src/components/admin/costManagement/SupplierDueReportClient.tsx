
'use client';

import React, { useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Supplier } from '@/types';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type SupplierWithDue = Supplier & {
  dueAmount: number;
};

export function SupplierDueReportClient() {
  const { settings, addBulkSupplierPayments, isLoaded } = useSettings();
  const { suppliers, supplierBills, supplierPayments } = settings;
  const router = useRouter();

  const suppliersWithDues = useMemo((): SupplierWithDue[] => {
    if (!isLoaded) return [];

    const supplierDataMap = new Map<string, { totalBilled: number; totalPaid: number }>();

    suppliers.forEach(s => {
      supplierDataMap.set(s.id, { totalBilled: 0, totalPaid: 0 });
    });

    supplierBills.forEach(bill => {
        if (!supplierDataMap.has(bill.supplierId)) return;
        const data = supplierDataMap.get(bill.supplierId)!;
        data.totalBilled += bill.totalAmount;
        data.totalPaid += bill.paidAmount || 0;
    });

    supplierPayments.forEach(payment => {
        if (!supplierDataMap.has(payment.supplierId)) return;
        const data = supplierDataMap.get(payment.supplierId)!;
        if (!payment.billId) { // Only add general payments, bill-specific payments are covered in bill.paidAmount
            data.totalPaid += payment.amount;
        }
    });

    return suppliers
      .map(supplier => {
        const dueData = supplierDataMap.get(supplier.id);
        if (!dueData) return null;

        const dueAmount = dueData.totalBilled - dueData.totalPaid;

        if (dueAmount <= 0.01) return null; // Use a small epsilon for float comparison
        
        return {
          ...supplier,
          dueAmount: dueAmount,
        };
      })
      .filter((s): s is SupplierWithDue => s !== null)
      .sort((a, b) => b.dueAmount - a.dueAmount);

  }, [suppliers, supplierBills, supplierPayments, isLoaded]);

  const handleMakePayment = (supplierId: string) => {
    router.push(`/admin/modules/costManagement/payments?supplierId=${supplierId}`);
  };

  const handleDownloadDueList = () => {
    const dataToExport = suppliersWithDues.map(s => ({
      supplierId: s.id,
      supplierName: s.name,
      currentDue: s.dueAmount.toFixed(2),
      paymentAmount: '',
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SupplierDues");
    XLSX.writeFile(wb, "supplier_dues_for_payment.xlsx");
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

        const paymentsToProcess: { supplierId: string, amount: number }[] = [];
        let errors: string[] = [];

        json.forEach((row, index) => {
          const { supplierId, paymentAmount } = row;
          const amount = parseFloat(paymentAmount);
          
          if (paymentAmount && !isNaN(amount) && amount > 0) {
            if (!supplierId) {
              errors.push(`Row ${index + 2}: Missing supplierId.`);
              return;
            }
            if (!suppliers.find(s => s.id === supplierId)) {
               errors.push(`Row ${index + 2}: Supplier with ID "${supplierId}" not found.`);
               return;
            }
            paymentsToProcess.push({ supplierId, amount });
          }
        });

        if (paymentsToProcess.length > 0) {
          addBulkSupplierPayments(paymentsToProcess);
        }

        alert(`${paymentsToProcess.length} payments processed successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

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
    return <div>Loading report...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Due to Suppliers</CardTitle>
                <CardDescription>
                A list of all suppliers with pending payments.
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <Button onClick={handleDownloadDueList} variant="outline" size="sm" disabled={suppliersWithDues.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Download Due List
                 </Button>
                 <Button asChild variant="outline" size="sm">
                    <Label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Upload Payments
                        <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                    </Label>
                 </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliersWithDues.length > 0 ? (
              suppliersWithDues.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.mobile}</TableCell>
                  <TableCell>{supplier.contactPerson || 'N/A'}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    ৳{supplier.dueAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleMakePayment(supplier.id)}>
                      Make Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No supplier dues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
