
import { ServiceBillingClient } from "@/components/admin/serviceJob/ServiceBillingClient";
import { Receipt } from "lucide-react";
import { Suspense } from "react";

function ServiceBillingPageContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Service Billing</h1>
      </div>
      <div className="flex-grow relative">
        <ServiceBillingClient />
      </div>
    </div>
  );
}

export default function ServiceBillingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ServiceBillingPageContent />
        </Suspense>
    )
}
