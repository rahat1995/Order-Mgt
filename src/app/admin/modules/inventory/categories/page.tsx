
import { InvCategoryManagementClient } from "@/components/admin/inventory/InvCategoryManagementClient";
import { ListTree } from "lucide-react";

export default function InvCategoryManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListTree className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Inventory Category Management</h1>
      </div>
       <p className="text-muted-foreground">
        Organize your inventory products with a hierarchical category structure.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <InvCategoryManagementClient />
    </div>
  );
}
