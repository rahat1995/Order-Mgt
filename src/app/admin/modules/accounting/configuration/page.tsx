
import { AccountingConfigurationClient } from "@/components/admin/accounting/AccountingConfigurationClient";
import { Settings } from "lucide-react";

export default function AccountingConfigurationPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Accounting Configuration</h1>
      </div>
      <p className="text-muted-foreground">
        Set up your fiscal year, opening dates, and enter opening balances for your ledger accounts.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AccountingConfigurationClient />
    </div>
  );
}
