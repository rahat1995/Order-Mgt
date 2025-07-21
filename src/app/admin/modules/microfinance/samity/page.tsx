
'use client';

import { SamityManagementClient } from "@/components/admin/microfinance/SamityManagementClient";
import { Users } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function SamityManagementPage() {
  const { settings } = useSettings();
  const { samityTerm } = settings.microfinanceSettings;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{samityTerm} Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your {samityTerm}s (member groups). Each member must belong to a {samityTerm}.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <SamityManagementClient />
    </div>
  );
}
