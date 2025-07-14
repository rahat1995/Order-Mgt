
import { SupplierDueReportClient } from "@/components/admin/costManagement/SupplierDueReportClient";
import { LineChart } from "lucide-react";

export default function SupplierDueReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <LineChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Supplier Due Report</h1>
      </div>
       <p className="text-muted-foreground">
        View a list of all suppliers with outstanding bill payments.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SupplierDueReportClient />
    </div>
  );
}
