
import { ModelManagementClient } from "@/components/admin/inventory/ModelManagementClient";
import { Library } from "lucide-react";

export default function ModelManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Library className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Model Management</h1>
      </div>
       <p className="text-muted-foreground">
        Manage product models and associate them with brands.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ModelManagementClient />
    </div>
  );
}
