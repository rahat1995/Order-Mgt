
import { DesignationManagementClient } from "@/components/admin/hr/DesignationManagementClient";
import { Briefcase } from "lucide-react";

export default function DesignationManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Briefcase className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Designation Management</h1>
      </div>
      <p className="text-muted-foreground">
        Define all the job titles and roles within your organization.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <DesignationManagementClient />
    </div>
  );
}
