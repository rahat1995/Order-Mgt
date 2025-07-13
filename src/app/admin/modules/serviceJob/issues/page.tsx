import { ServiceIssueManagementClient } from "@/components/admin/serviceJob/ServiceIssueManagementClient";
import { Bug } from "lucide-react";

export default function ManageIssueTypesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Bug className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Manage Issue Types</h1>
      </div>
      <p className="text-muted-foreground">
        Define the common problems or issues for your service items (e.g., "Broken Screen", "Battery Replacement").
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ServiceIssueManagementClient />
    </div>
  );
}
