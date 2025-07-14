
import { EmployeeManagementClient } from "@/components/admin/hr/EmployeeManagementClient";
import { UserPlus } from "lucide-react";

export default function EmployeeManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UserPlus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Employee Management</h1>
      </div>
      <p className="text-muted-foreground">
        Add, view, and manage all your staff members.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <EmployeeManagementClient />
    </div>
  );
}
