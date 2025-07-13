
import { VoucherManagementClient } from "@/components/admin/pos/VoucherManagementClient";
import { Ticket } from "lucide-react";

export default function VoucherManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Ticket className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Voucher Management</h1>
      </div>
      <p className="text-muted-foreground">
        Create and manage promotional discount vouchers.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <VoucherManagementClient />
    </div>
  );
}
