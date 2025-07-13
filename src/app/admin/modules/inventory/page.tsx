
import { ProductListClient } from "@/components/admin/inventory/ProductListClient";
import { Boxes } from "lucide-react";

export default function InventoryProductListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Boxes className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Product List</h1>
      </div>
       <p className="text-muted-foreground">
        Define and manage all products in your inventory.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ProductListClient />
    </div>
  );
}
