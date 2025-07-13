
'use client';

import { ChallanConfigurationForm } from "@/components/admin/challan/ChallanConfigurationForm";
import { Settings } from "lucide-react";

export default function ChallanConfigurationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Challan Configuration</h1>
      </div>
       <p className="text-muted-foreground">
        Customize settings for challan printing and behavior.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <ChallanConfigurationForm />
    </div>
  );
}
