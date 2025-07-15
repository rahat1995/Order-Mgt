
import { AccountTypeClient } from "@/components/admin/accounting/AccountTypeClient";
import { SlidersHorizontal } from "lucide-react";

export default function AccountTypesPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <SlidersHorizontal className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Account Types</h1>
      </div>
      <p className="text-muted-foreground">
        Manage the fundamental classifications for your ledger accounts (e.g., Asset, Liability, Income, Expense).
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AccountTypeClient />
    </div>
  );
}
