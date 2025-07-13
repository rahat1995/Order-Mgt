
import { CreateChallanClient } from "@/components/admin/challan/CreateChallanClient";
import { FilePlus } from "lucide-react";

export default function CreateChallanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FilePlus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Create New Challan</h1>
      </div>
       <p className="text-muted-foreground">
        Log a new delivery by selecting a customer and adding serialized products.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <CreateChallanClient />
    </div>
  );
}
