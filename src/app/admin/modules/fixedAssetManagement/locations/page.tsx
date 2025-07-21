
import { AssetLocationManagementClient } from "@/components/admin/fixedAsset/AssetLocationManagementClient";
import { Locate } from "lucide-react";

export default function AssetLocationPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Locate className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Asset Locations</h1>
      </div>
      <p className="text-muted-foreground">
        Manage the physical locations of assets, such as branches or head office.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AssetLocationManagementClient />
    </div>
  );
}
