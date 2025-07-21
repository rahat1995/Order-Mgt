
import { AssetRegistrationClient } from "@/components/admin/fixedAsset/AssetRegistrationClient";
import { List } from "lucide-react";

export default function AssetRegistrationPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <List className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Asset Registration</h1>
      </div>
      <p className="text-muted-foreground">
        Register a new fixed asset by providing its details below.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AssetRegistrationClient />
    </div>
  );
}
