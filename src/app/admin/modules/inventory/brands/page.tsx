
import { BrandManagementClient } from "@/components/admin/inventory/BrandManagementClient";
import { Copyright } from "lucide-react";

export default function BrandManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Copyright className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Brand Management</h1>
      </div>
       <p className="text-muted-foreground">
        Manage the brands for your inventory products.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <BrandManagementClient />
    </div>
  );
}
