import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function UserAccessControlPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">User Access Control</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Roles & Permissions</CardTitle>
          <CardDescription>
            Define user roles and control access to different modules. This module is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Future features for creating roles, assigning permissions, and managing user access will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
