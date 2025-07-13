
import { ExpenseCategoryClient } from "@/components/admin/costManagement/ExpenseCategoryClient";
import { BarChart3 } from "lucide-react";

export default function ExpenseCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Expense Categories</h1>
      </div>
       <p className="text-muted-foreground">
        Define categories for your expenses to organize your spending.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ExpenseCategoryClient />
    </div>
  );
}
