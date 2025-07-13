
import { SupplierManagementClient } from "@/components/admin/costManagement/SupplierManagementClient";
import { Truck } from "lucide-react";

export default function SupplierManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Truck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Supplier Management</h1>
      </div>
       <p className="text-muted-foreground">
        Add, view, and manage your vendors and suppliers.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SupplierManagementClient />
    </div>
  );
}
