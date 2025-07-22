
import { SavingsProductTypeClient } from "@/components/admin/microfinance/SavingsProductTypeClient";
import { ListChecks } from "lucide-react";

export default function SavingsProductTypesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListChecks className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Savings Product Types</h1>
      </div>
       <p className="text-muted-foreground">
        Define and manage the fundamental types of savings products your organization offers.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SavingsProductTypeClient />
    </div>
  );
}
