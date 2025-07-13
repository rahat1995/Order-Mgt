
import { AttributeValueManagementClient } from "@/components/admin/inventory/AttributeValueManagementClient";
import { ListPlus } from "lucide-react";

export default function AttributeValueManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListPlus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Attribute Value Management</h1>
      </div>
       <p className="text-muted-foreground">
        Add the possible values for each attribute you have defined.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AttributeValueManagementClient />
    </div>
  );
}
