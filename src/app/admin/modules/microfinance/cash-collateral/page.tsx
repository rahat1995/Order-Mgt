
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote } from "lucide-react";

export default function CashCollateralPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Banknote className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Cash Collateral Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to manage cash collaterals for loans here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include recording collateral amounts, linking them to loans, and managing their status.</p>
        </CardContent>
      </Card>
    </div>
  );
}
