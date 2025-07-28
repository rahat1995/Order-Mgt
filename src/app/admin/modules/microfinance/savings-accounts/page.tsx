
import { Wallet } from "lucide-react";
import { SavingsAccountClient } from "@/components/admin/microfinance/SavingsAccountClient";

export default function SavingsAccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Wallet className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Member Savings Accounts</h1>
      </div>
       <p className="text-muted-foreground">
        View all member savings accounts and open new accounts for existing members.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SavingsAccountClient />
    </div>
  );
}
