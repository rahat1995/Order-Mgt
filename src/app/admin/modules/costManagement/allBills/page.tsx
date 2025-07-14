
import { AllBillsClient } from "@/components/admin/costManagement/AllBillsClient";
import { List } from "lucide-react";

export default function AllBillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <List className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">All Recorded Bills</h1>
      </div>
       <p className="text-muted-foreground">
        View a history of all bills recorded from your suppliers.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AllBillsClient />
    </div>
  );
}
