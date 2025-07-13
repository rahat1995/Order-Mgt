import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function HrManagementPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">HR Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Human Resources</CardTitle>
          <CardDescription>
            Manage your employees, payroll, attendance, and roles. This module is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features for employee profiles, payroll processing, and attendance tracking will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
