import { HandCoins } from "lucide-react";

export default function InterestDisbursementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <HandCoins className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Interest Disbursement</h1>
      </div>
       <p className="text-muted-foreground">
        Disburse previously provisioned interest to member savings accounts. This feature is under construction.
      </p>
      <div className="h-[1px] w-full bg-border" />
    </div>
  );
}
