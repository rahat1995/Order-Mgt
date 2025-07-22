
import { Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CashCollateralPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Banknote className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Cash Collateral Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cash Collateral Transactions</CardTitle>
          <CardDescription>
            This section will display all collected cash collaterals from members. Functionality to record and manage these transactions is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground p-8">No cash collateral transactions recorded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
