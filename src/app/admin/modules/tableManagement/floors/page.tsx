
import { FloorManagementClient } from "@/components/admin/tableManagement/FloorManagementClient";
import { Layers } from "lucide-react";

export default function ManageFloorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Layers className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Manage Floors</h1>
      </div>
      <p className="text-muted-foreground">
        Define the different floors or sections of your restaurant (e.g., Ground Floor, Rooftop).
      </p>
      <div className="h-[1px] w-full bg-border" />
      <FloorManagementClient />
    </div>
  );
}
