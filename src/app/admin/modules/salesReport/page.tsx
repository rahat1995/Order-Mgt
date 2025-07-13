
import { SalesReportClient } from "@/components/admin/reports/SalesReportClient";
import { LineChart } from "lucide-react";

export default function SalesReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <LineChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Sales Report</h1>
      </div>
       <p className="text-muted-foreground">
        Analyze your sales performance with date range filtering and export options.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SalesReportClient />
    </div>
  );
}
