
import { ChartOfAccountsClient } from "@/components/admin/accounting/ChartOfAccountsClient";
import { BookUser } from "lucide-react";

export default function AccountingPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <BookUser className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Chart of Accounts</h1>
      </div>
      <p className="text-muted-foreground">
        Manage the foundational structure of your financial accounts. Define groups, heads, and ledger accounts.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ChartOfAccountsClient />
    </div>
  );
}
