
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Archive, AppWindow, List, Locate, Milestone, Repeat, Trash2, TrendingDown } from 'lucide-react';

const fixedAssetSubModules = [
  {
    href: '/admin/modules/fixedAssetManagement/asset-registration',
    icon: List,
    title: 'Asset Registration',
    description: 'Add new fixed assets to the system.',
    enabled: true,
  },
  {
    href: '/admin/modules/fixedAssetManagement/asset-list',
    icon: AppWindow,
    title: 'Asset List',
    description: 'View and manage all registered assets.',
    enabled: true,
  },
  {
    href: '/admin/modules/fixedAssetManagement/depreciation',
    icon: TrendingDown,
    title: 'Depreciation',
    description: 'Manage and run depreciation for assets.',
    enabled: false,
  },
  {
    href: '/admin/modules/fixedAssetManagement/asset-categories',
    icon: Milestone,
    title: 'Asset Categories',
    description: 'Define categories for your fixed assets.',
    enabled: false,
  },
  {
    href: '/admin/modules/fixedAssetManagement/locations',
    icon: Locate,
    title: 'Asset Locations',
    description: 'Manage physical locations of assets.',
    enabled: true,
  },
  {
    href: '/admin/modules/fixedAssetManagement/asset-transfer',
    icon: Repeat,
    title: 'Asset Transfer',
    description: 'Record the movement of assets between locations.',
    enabled: false,
  },
  {
    href: '/admin/modules/fixedAssetManagement/asset-disposal',
    icon: Trash2,
    title: 'Asset Disposal',
    description: 'Manage the sale or disposal of assets.',
    enabled: false,
  },
];

export default function FixedAssetManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Archive className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Fixed Asset Management</h1>
      </div>
      <p className="text-muted-foreground">
        Track and manage your company's physical assets throughout their lifecycle.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fixedAssetSubModules.map((module) => (
          <Card
            key={module.title}
            className={`hover:shadow-lg transition-shadow ${!module.enabled ? 'bg-muted/50 cursor-not-allowed' : ''}`}
          >
            <Link href={module.enabled ? module.href : '#'} passHref>
              <div className="h-full flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <module.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                    {!module.enabled && <span className="text-xs block text-primary/70">(Coming soon)</span>}
                  </p>
                </CardContent>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
