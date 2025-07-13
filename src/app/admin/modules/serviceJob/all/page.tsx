
import { AllServiceJobsClient } from "@/components/admin/serviceJob/AllServiceJobsClient";
import { ListOrdered } from "lucide-react";

export default function AllServiceJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ListOrdered className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">All Service Jobs</h1>
      </div>
       <p className="text-muted-foreground">
        View and manage all created service jobs.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <AllServiceJobsClient />
    </div>
  );
}
