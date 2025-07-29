
import { SavingsTransactionClient } from "@/components/admin/microfinance/SavingsTransactionClient";
import { Banknote } from "lucide-react";

export default function SavingsTransactionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Banknote className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Savings Transactions</h1>
      </div>
      <p className="text-muted-foreground">
        Manage member savings by recording deposits, withdrawals, and paying out interest.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SavingsTransactionClient />
    </div>
  );
}
