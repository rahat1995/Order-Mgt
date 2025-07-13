
import { ChallanListClient } from "@/components/admin/challan/ChallanListClient";
import { FileText } from "lucide-react";

export default function ChallanListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Challan Management</h1>
      </div>
       <p className="text-muted-foreground">
        View and manage all delivery challans. You can create bills from here.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ChallanListClient />
    </div>
  );
}
