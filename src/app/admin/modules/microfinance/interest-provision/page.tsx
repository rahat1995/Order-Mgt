import { Calculator } from "lucide-react";

export default function InterestProvisionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Interest Provision</h1>
      </div>
       <p className="text-muted-foreground">
        Calculate and provision interest for savings accounts based on their product rules. This feature is under construction.
      </p>
      <div className="h-[1px] w-full bg-border" />
    </div>
  );
}
