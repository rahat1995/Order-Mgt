
import { AssetCategoryClient } from "@/components/admin/fixedAsset/AssetCategoryClient";
import { Milestone } from "lucide-react";

export default function AssetCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Milestone className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Asset Categories</h1>
      </div>
      <p className="text-muted-foreground">
        Define categories for your fixed assets to organize them (e.g., Furniture, Electronics, Vehicles).
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AssetCategoryClient />
    </div>
  );
}
