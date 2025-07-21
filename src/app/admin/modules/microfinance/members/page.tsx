
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function MemberManagementPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Member Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to add, view, and manage all your microfinance members here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include member profiles, transaction history, and group management.</p>
        </CardContent>
      </Card>
    </div>
  );
}
