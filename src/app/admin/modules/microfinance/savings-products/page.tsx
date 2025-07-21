
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function SavingsProductsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Savings Products</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to define and manage various savings products for your members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include setting interest rates, minimum balances, and withdrawal rules.</p>
        </CardContent>
      </Card>
    </div>
  );
}
