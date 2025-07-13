
'use client';
import { CreateBillClient } from "@/components/admin/challan/CreateBillClient";
import { Receipt } from "lucide-react";
import { useParams } from "next/navigation";

export default function CreateBillPage() {
  const params = useParams();
  const challanId = params.challanId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Create Bill from Challan</h1>
      </div>
       <p className="text-muted-foreground">
        Select items from the challan to include in this bill.
      </p>
      <div className="h-[1px] w-full bg-border" />
      {challanId ? <CreateBillClient challanId={challanId} /> : <p>Loading challan details...</p>}
    </div>
  );
}
