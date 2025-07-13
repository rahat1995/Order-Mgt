
import { PendingBillReportClient } from "@/components/admin/reports/PendingBillReportClient";
import { FileClock } from "lucide-react";

export default function PendingBillReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FileClock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Pending Bills Report</h1>
      </div>
       <p className="text-muted-foreground">
        View all unbilled or partially billed challans and service jobs.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <PendingBillReportClient />
    </div>
  );
}
