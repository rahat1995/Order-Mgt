
import { CustomerLedgerClient } from "@/components/admin/reports/CustomerLedgerClient";
import { ClipboardList } from "lucide-react";

export default function CustomerLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Customer Ledger</h1>
      </div>
       <p className="text-muted-foreground">
        Select a customer to view their complete transaction history, including sales and payments.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <CustomerLedgerClient />
    </div>
  );
}
