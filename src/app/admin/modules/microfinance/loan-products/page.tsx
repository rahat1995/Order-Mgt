
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function LoanProductsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Loan Products</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to define and manage various loan products offered by your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include setting interest rates, loan terms, and repayment schedules.</p>
        </CardContent>
      </Card>
    </div>
  );
}
