
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function GuarantorPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <UserCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Guarantor Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section is under construction. You will be able to manage loan guarantors here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features will include adding guarantors, linking them to loan applications, and viewing their details.</p>
        </CardContent>
      </Card>
    </div>
  );
}
