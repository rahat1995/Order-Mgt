
import { InterestManagementClient } from "@/components/admin/microfinance/InterestManagementClient";
import { HandCoins } from "lucide-react";

export default function InterestManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <HandCoins className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Interest Management</h1>
      </div>
       <p className="text-muted-foreground">
        Calculate, provision, and disburse interest for member savings accounts.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <InterestManagementClient />
    </div>
  );
}
