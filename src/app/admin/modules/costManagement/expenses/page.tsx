
import { LogExpenseClient } from "@/components/admin/costManagement/LogExpenseClient";
import { ClipboardList } from "lucide-react";

export default function LogExpensePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Log Expense or Bill</h1>
      </div>
       <p className="text-muted-foreground">
        Record general business expenses or bills from specific suppliers.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <LogExpenseClient />
    </div>
  );
}
