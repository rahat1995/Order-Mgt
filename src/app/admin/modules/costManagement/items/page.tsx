
import { RawMaterialClient } from "@/components/admin/costManagement/RawMaterialClient";
import { ShoppingBasket } from "lucide-react";

export default function RawMaterialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ShoppingBasket className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Raw Materials Management</h1>
      </div>
       <p className="text-muted-foreground">
        Add, view, and manage your purchasable raw materials or ingredients.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <RawMaterialClient />
    </div>
  );
}
