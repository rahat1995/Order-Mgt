
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutGrid, Layers, Map, CalendarCheck } from 'lucide-react';

const tableSubModules = [
  {
    href: '/admin/modules/tableManagement/reserve',
    icon: CalendarCheck,
    title: 'Table Reservation',
    description: 'View layouts and book tables for customers.',
    enabled: true,
  },
  {
    href: '/admin/modules/tableManagement/configure',
    icon: Map,
    title: 'Configure Layout',
    description: 'Visually arrange tables and landmarks on your floor plans.',
    enabled: true,
  },
  {
    href: '/admin/modules/tableManagement/floors',
    icon: Layers,
    title: 'Manage Floors',
    description: 'Define the floors or sections of your restaurant.',
    enabled: true,
  },
];

export default function TableManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <LayoutGrid className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Table Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your restaurant's floor plans, table layouts, and reservations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableSubModules.map((module) => (
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
