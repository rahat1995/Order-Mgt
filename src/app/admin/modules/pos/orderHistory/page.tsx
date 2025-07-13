


import { OrderHistoryClient } from "@/components/admin/pos/OrderHistoryClient";
import { History } from "lucide-react";

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <History className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Order History</h1>
      </div>
      <p className="text-muted-foreground">
        View and manage all pending and completed orders.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <OrderHistoryClient />
    </div>
  );
}
