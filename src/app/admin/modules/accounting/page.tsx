import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookUser } from "lucide-react";

export default function AccountingPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <BookUser className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Accounting Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accounting</CardTitle>
          <CardDescription>
            Manage your financial accounts, ledgers, and reports. This module is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features for managing chart of accounts, journal entries, and financial statements will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
