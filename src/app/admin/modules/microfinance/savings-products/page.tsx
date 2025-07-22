
import { SavingsProductClient } from "@/components/admin/microfinance/SavingsProductClient";
import { ClipboardList } from "lucide-react";

export default function SavingsProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Savings Products</h1>
      </div>
       <p className="text-muted-foreground">
        Define and manage the various savings products offered by your organization, based on the core savings types.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SavingsProductClient />
    </div>
  );
}
