
'use client';

import { OrganizationInfoForm } from '@/components/admin/OrganizationInfoForm';
import { ModuleManagementForm } from '@/components/admin/ModuleManagementForm';
import { ThemeSelector } from '@/components/admin/ThemeSelector';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization's settings and active modules.
        </p>
      </div>
      <div className="h-[1px] w-full bg-border" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <OrganizationInfoForm />
          <ThemeSelector />
        </div>
        <div className="lg:col-span-2">
          <ModuleManagementForm />
        </div>
      </div>
    </div>
  );
}
