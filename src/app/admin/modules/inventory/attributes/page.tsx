
import { AttributeManagementClient } from "@/components/admin/inventory/AttributeManagementClient";
import { ListCollapse } from "lucide-react";

export default function AttributeManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListCollapse className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Attribute Management</h1>
      </div>
       <p className="text-muted-foreground">
        Define reusable attributes for your products (e.g., Color, Size, Material).
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AttributeManagementClient />
    </div>
  );
}
