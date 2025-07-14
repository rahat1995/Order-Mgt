
import { SupplierPaymentClient } from "@/components/admin/costManagement/SupplierPaymentClient";
import { CreditCard } from "lucide-react";
import { Suspense } from "react";

function SupplierPaymentPageContent() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Supplier Payments</h1>
            </div>
            <p className="text-muted-foreground">
                Record payments made to suppliers. You can apply payments to specific bills or as a general payment.
            </p>
            <div className="h-[1px] w-full bg-border" />
            <SupplierPaymentClient />
        </div>
    );
}

export default function SupplierPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SupplierPaymentPageContent />
        </Suspense>
    )
}
