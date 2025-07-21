
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HandCoins, Users, Package, ClipboardList, Receipt, LineChart, Cog } from 'lucide-react';

const microfinanceSubModules = [
  {
    href: '/admin/modules/microfinance/members',
    icon: Users,
    title: 'Member Management',
    description: 'Add, view, and manage all members.',
    enabled: true,
  },
  {
    href: '/admin/modules/microfinance/loan-products',
    icon: Package,
    title: 'Loan Products',
    description: 'Define different types of loan products.',
    enabled: true,
  },
  {
    href: '/admin/modules/microfinance/savings-products',
    icon: ClipboardList,
    title: 'Savings Products',
    description: 'Define different types of savings products.',
    enabled: true,
  },
  {
    href: '/admin/modules/microfinance/loan-applications',
    icon: HandCoins,
    title: 'Loan Applications',
    description: 'Manage and process member loan applications.',
    enabled: false,
  },
  {
    href: '/admin/modules/microfinance/collections',
    icon: Receipt,
    title: 'Collections',
    description: 'Record loan repayments and savings deposits.',
    enabled: false,
  },
  {
    href: '/admin/modules/microfinance/reports',
    icon: LineChart,
    title: 'Reports',
    description: 'View various financial and operational reports.',
    enabled: false,
  },
   {
    href: '/admin/modules/microfinance/configuration',
    icon: Cog,
    title: 'Configuration',
    description: 'Set up global settings for the microfinance module.',
    enabled: false,
  },
];

export default function MicrofinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <HandCoins className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Microfinance</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your microfinance operations including members, loans, savings, and collections.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {microfinanceSubModules.map((module) => (
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
