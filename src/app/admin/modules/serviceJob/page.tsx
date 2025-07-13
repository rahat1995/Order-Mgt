
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, ListChecks, Tags, Bug, Settings, ListOrdered, FilePlus } from 'lucide-react';

const serviceJobSubModules = [
  {
    href: '/admin/modules/serviceJob/manage',
    icon: FilePlus,
    title: 'Create Service Job',
    description: 'Log a new service or repair request for a customer.',
    enabled: true,
  },
  {
    href: '/admin/modules/serviceJob/all',
    icon: ListOrdered,
    title: 'All Service Jobs',
    description: 'View and manage all ongoing and completed service jobs.',
    enabled: true,
  },
  {
    href: '/admin/modules/serviceJob/items',
    icon: ListChecks,
    title: 'Manage Service Items',
    description: 'Define billable services and accessory parts for jobs.',
    enabled: true,
  },
  {
    href: '/admin/modules/serviceJob/types',
    icon: Tags,
    title: 'Manage Service Types',
    description: 'Create service categories (e.g., Repair, Maintenance).',
    enabled: true,
  },
   {
    href: '/admin/modules/serviceJob/issues',
    icon: Bug,
    title: 'Manage Issue Types',
    description: 'Define common issues for service items (e.g., Screen Damage).',
    enabled: true,
  },
  {
    href: '/admin/modules/serviceJob/configuration',
    icon: Settings,
    title: 'Service Job Configuration',
    description: 'Configure settings for the service job module.',
    enabled: true,
  },
];

export default function ServiceJobPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Wrench className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Service Job Management</h1>
      </div>
      <p className="text-muted-foreground">
        Select a section below to manage your service job settings and operations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceJobSubModules.map((module) => (
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
                  <CardDescription>
                    {module.description}
                    {!module.enabled && <span className="text-xs block text-primary/70">(Coming soon)</span>}
                  </CardDescription>
                </CardContent>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
