
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, UserPlus } from 'lucide-react';

const hrSubModules = [
  {
    href: '/admin/modules/hrManagement/employees',
    icon: UserPlus,
    title: 'Employee Management',
    description: 'Add, edit, and manage all staff members.',
    enabled: true,
  },
  {
    href: '/admin/modules/hrManagement/designations',
    icon: Briefcase,
    title: 'Designation Management',
    description: 'Define job titles and roles for your employees.',
    enabled: true,
  },
  {
    href: '/admin/modules/hrManagement/payroll',
    icon: Users,
    title: 'Payroll',
    description: 'Process salaries and manage payroll records.',
    enabled: false,
  },
  {
    href: '/admin/modules/hrManagement/attendance',
    icon: Users,
    title: 'Attendance',
    description: 'Track employee attendance and leave.',
    enabled: false,
  },
];

export default function HrManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">HR Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your employees, designations, payroll, and attendance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hrSubModules.map((module) => (
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
