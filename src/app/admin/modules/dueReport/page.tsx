
import { CustomerDueReportClient } from "@/components/admin/reports/CustomerDueReportClient";
import { UserX } from "lucide-react";

export default function CustomerDueReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UserX className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Customer Due Report</h1>
      </div>
       <p className="text-muted-foreground">
        View a list of all customers with outstanding due balances.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <CustomerDueReportClient />
    </div>
  );
}
