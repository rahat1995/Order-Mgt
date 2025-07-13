
import { PosConfigurationForm } from "@/components/admin/pos/PosConfigurationForm";
import { Settings } from "lucide-react";

export default function PosConfigurationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">POS Configuration</h1>
      </div>
       <p className="text-muted-foreground">
        Customize the behavior and appearance of the Point of Sale interface.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <PosConfigurationForm />
    </div>
  );
}
