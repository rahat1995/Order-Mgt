import { OrderEntryClient } from "@/components/admin/pos/OrderEntryClient";
import { ClipboardList } from "lucide-react";

export default function OrderEntryPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Order Entry</h1>
      </div>
      <div className="flex-grow relative">
        <OrderEntryClient />
      </div>
    </div>
  );
}
