
'use client';

import { VoucherListClient } from "@/components/admin/accounting/VoucherListClient";
import { ReceiptText, FilePenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoucherEntryClient } from "@/components/admin/accounting/VoucherEntryClient";


export default function VouchersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ReceiptText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Accounting Vouchers</h1>
      </div>
       <p className="text-muted-foreground">
        Record and view all financial transactions such as payments, receipts, and journal entries.
      </p>
      <div className="h-[1px] w-full bg-border" />
      
      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entry"><FilePenLine className="mr-2 h-4 w-4" />Voucher Entry</TabsTrigger>
            <TabsTrigger value="list"><ReceiptText className="mr-2 h-4 w-4" />Voucher List</TabsTrigger>
        </TabsList>
        <TabsContent value="entry">
            <VoucherEntryClient />
        </TabsContent>
        <TabsContent value="list">
            <VoucherListClient />
        </TabsContent>
      </Tabs>

    </div>
  );
}
