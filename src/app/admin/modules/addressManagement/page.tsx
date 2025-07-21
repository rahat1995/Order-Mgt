
import { AddressManagementClient } from "@/components/admin/address/AddressManagementClient";
import { MapPin } from "lucide-react";

export default function AddressManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MapPin className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Address Data Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage all geographical address data for your organization.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AddressManagementClient />
    </div>
  );
}
