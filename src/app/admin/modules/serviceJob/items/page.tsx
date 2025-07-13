
import { ServiceItemManagementClient } from "@/components/admin/serviceJob/ServiceItemManagementClient";
import { ListChecks } from "lucide-react";

export default function ManageServiceItemsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListChecks className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Manage Service Items & Parts</h1>
      </div>
      <p className="text-muted-foreground">
        Define the billable services and accessory parts for your service jobs. Organize them into categories for easy management.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ServiceItemManagementClient />
    </div>
  );
}
