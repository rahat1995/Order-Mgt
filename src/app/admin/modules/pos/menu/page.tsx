import { MenuManagementClient } from "@/components/admin/pos/MenuManagementClient";
import { UtensilsCrossed } from "lucide-react";

export default function MenuManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Menu Management</h1>
        </div>
      </div>
      <p className="text-muted-foreground">
        Manage categories and items. You can add items individually or upload them in bulk using a CSV file.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <MenuManagementClient />
    </div>
  );
}
