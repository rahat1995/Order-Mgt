

import { CustomerManagementClient } from "@/components/admin/pos/CustomerManagementClient";
import { Users } from "lucide-react";
import { CustomerGroupManagement } from "@/components/admin/pos/CustomerGroupManagement";

export default function CustomerManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Customer Management</h1>
      </div>
       <p className="text-muted-foreground">
        Add, view, and manage your customer information and groups.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <CustomerGroupManagement />
      <div className="h-[1px] w-full bg-border" />
      <CustomerManagementClient />
    </div>
  );
}
