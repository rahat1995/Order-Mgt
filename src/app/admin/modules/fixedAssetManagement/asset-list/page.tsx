
import { AssetListClient } from "@/components/admin/fixedAsset/AssetListClient";
import { AppWindow } from "lucide-react";

export default function AssetListPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <AppWindow className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Asset List</h1>
      </div>
      <p className="text-muted-foreground">
        View and manage all registered fixed assets.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AssetListClient />
    </div>
  );
}
