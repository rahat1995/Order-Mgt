
import { SamityManagementClient } from "@/components/admin/microfinance/SamityManagementClient";
import { Users } from "lucide-react";

export default function SamityManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Samity Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your Samities (member groups). Each member must belong to a Samity.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SamityManagementClient />
    </div>
  );
}
