
import { LoanProductClient } from "@/components/admin/microfinance/LoanProductClient";
import { Package } from "lucide-react";

export default function LoanProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Loan Products</h1>
      </div>
       <p className="text-muted-foreground">
        Define and manage the various loan products offered by your organization.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <LoanProductClient />
    </div>
  );
}
