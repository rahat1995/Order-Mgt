
import { ProductManagementClient } from "@/components/admin/product/ProductManagementClient";
import { Package } from "lucide-react";

export default function ProductManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Simple Product Management</h1>
        </div>
      </div>
      <p className="text-muted-foreground">
        Manage non-serialized products used primarily in Challans and Billing. You can add items individually or upload them in bulk.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ProductManagementClient />
    </div>
  );
}
