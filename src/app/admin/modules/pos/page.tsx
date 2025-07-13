
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Users, Ticket, ClipboardList, Settings } from 'lucide-react';

const posSubModules = [
  {
    href: '/admin/modules/pos/orderEntry',
    icon: ClipboardList,
    title: 'Order Entry',
    description: 'Create and manage customer orders.',
    enabled: true,
  },
  {
    href: '/admin/modules/pos/menu',
    icon: UtensilsCrossed,
    title: 'Menu Management',
    description: 'Manage categories and menu items.',
    enabled: true,
  },
  {
    href: '/admin/modules/pos/voucher',
    icon: Ticket,
    title: 'Voucher Management',
    description: 'Create and manage promotional vouchers.',
    enabled: true,
  },
  {
    href: '/admin/modules/pos/configuration',
    icon: Settings,
    title: 'POS Configuration',
    description: 'Configure settings for the POS module.',
    enabled: true,
  },
];

export default function PosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UtensilsCrossed className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Point of Sale</h1>
      </div>
      <p className="text-muted-foreground">
        Select a section below to manage your POS settings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posSubModules.map((module) => (
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
