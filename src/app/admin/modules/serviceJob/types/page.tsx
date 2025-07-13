
import { ServiceTypeManagementClient } from "@/components/admin/serviceJob/ServiceTypeManagementClient";
import { Tags } from "lucide-react";

export default function ManageServiceTypesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Tags className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Manage Service Types</h1>
      </div>
      <p className="text-muted-foreground">
        Define the categories of service you offer (e.g., "Hardware Repair," "Software Installation," "General Maintenance").
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ServiceTypeManagementClient />
    </div>
  );
}
