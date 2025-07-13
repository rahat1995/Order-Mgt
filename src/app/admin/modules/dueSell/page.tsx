

import { DueManagementClient } from "@/components/admin/due/DueManagementClient";
import { Receipt } from "lucide-react";
import { Suspense } from "react";

function DueSellPageContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Due Collection</h1>
      </div>
       <p className="text-muted-foreground">
        Search for a customer to view their due balance, payment history, and record new collections.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <DueManagementClient />
    </div>
  );
}


export default function DueSellPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DueSellPageContent />
        </Suspense>
    )
}
