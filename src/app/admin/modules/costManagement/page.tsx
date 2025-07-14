
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Truck, ClipboardList, BarChart3, LineChart, ShoppingBasket, CreditCard } from 'lucide-react';

const costSubModules = [
  {
    href: '/admin/modules/costManagement/suppliers',
    icon: Truck,
    title: 'Supplier Management',
    description: 'Manage all your vendors and suppliers.',
    enabled: true,
  },
  {
    href: '/admin/modules/costManagement/items',
    icon: ShoppingBasket,
    title: 'Raw Materials',
    description: 'Manage all purchasable raw materials and ingredients.',
    enabled: true,
  },
  {
    href: '/admin/modules/costManagement/expenses',
    icon: ClipboardList,
    title: 'Record Expense Bill',
    description: 'Record all business expenses and supplier bills.',
    enabled: true,
  },
  {
    href: '/admin/modules/costManagement/categories',
    icon: BarChart3,
    title: 'Expense Categories',
    description: 'Define categories for your expenses.',
    enabled: true,
  },
  {
    href: '/admin/modules/costManagement/payments',
    icon: CreditCard,
    title: 'Supplier Payments',
    description: 'Record payments made to suppliers for bills.',
    enabled: true,
  },
  {
    href: '/admin/modules/costManagement/supplierDueReport',
    icon: LineChart,
    title: 'Supplier Due Report',
    description: 'View outstanding payables to suppliers.',
    enabled: true,
  },
];

export default function CostManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <DollarSign className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Cost Management</h1>
      </div>
      <p className="text-muted-foreground">
        Track your expenses, manage supplier bills, and oversee costs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {costSubModules.map((module) => (
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
