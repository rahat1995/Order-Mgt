
import { CreateServiceJobClient } from "@/components/admin/serviceJob/CreateServiceJobClient";
import { Wrench } from "lucide-react";

export default function CreateServiceJobPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Wrench className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Create New Service Job</h1>
      </div>
      <p className="text-muted-foreground">
        Log a new service request by filling out the customer and device details below.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <CreateServiceJobClient />
    </div>
  );
}
