
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Settings, 
  Package,
  ShoppingCart, 
  Receipt, 
  Wrench, 
  FileText, 
  Boxes, 
  LayoutGrid, 
  DollarSign, 
  BookUser, 
  Users, 
  ShieldCheck,
  LineChart,
  ListOrdered,
  FilePlus,
  UserX,
  Cog,
  FileClock,
  ListTree,
  Copyright,
  Library,
  Map,
  Layers,
  Truck,
  BarChart3,
  ClipboardList,
  ListCollapse,
  ListPlus,
  UserPlus,
  Briefcase,
  ShoppingBasket,
  CreditCard,
  List,
  SlidersHorizontal,
  ReceiptText,
  HandCoins,
  Archive,
  AppWindow,
  Locate,
  Milestone,
  MapPin,
  UserCheck,
  Banknote,
  ListChecks,
  Wallet,
  ArrowDownToDot,
  ArrowUpFromDot,
  Shuffle,
  Calculator,
  Vote,
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const mainNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const moduleLinks = [
    { key: 'pos', label: 'POS', icon: ShoppingCart, href: '/admin/modules/pos' },
    { key: 'customerManagement', label: 'Customers', icon: Users, href: '/admin/modules/customerManagement' },
    { key: 'customerLedger', label: 'Customer Ledger', icon: ClipboardList, href: '/admin/modules/customerLedger' },
    { key: 'salesReport', label: 'Sales Report', icon: LineChart, href: '/admin/modules/salesReport' },
    { key: 'dueReport', label: 'Due Report', icon: UserX, href: '/admin/modules/dueReport' },
    { key: 'pendingBillReport', label: 'Pending Bills', icon: FileClock, href: '/admin/modules/pendingBillReport' },
    { key: 'dueSell', label: 'Due Collection', icon: Receipt, href: '/admin/modules/dueSell' },
    { key: 'serviceJob', label: 'Service Job', icon: Wrench, href: '/admin/modules/serviceJob',
      subLinks: [
        { href: '/admin/modules/serviceJob/manage', label: 'Create Service Job', icon: FilePlus },
        { href: '/admin/modules/serviceJob/all', label: 'All Service Jobs', icon: ListOrdered },
      ]
    },
    { key: 'challanAndBilling', label: 'Challan & Billing', icon: FileText, href: '/admin/modules/challanAndBilling',
       subLinks: [
        { href: '/admin/modules/challanAndBilling/create', label: 'Create Challan', icon: FilePlus },
        { href: '/admin/modules/challanAndBilling/configuration', label: 'Configuration', icon: Cog },
      ]
    },
    { key: 'productManagement', label: 'Simple Products', icon: Package, href: '/admin/modules/productManagement' },
    { key: 'inventory', label: 'Inventory', icon: Boxes, href: '/admin/modules/inventory',
      subLinks: [
        { href: '/admin/modules/inventory/categories', label: 'Categories', icon: ListTree },
        { href: '/admin/modules/inventory/brands', label: 'Brands', icon: Copyright },
        { href: '/admin/modules/inventory/models', label: 'Models', icon: Library },
        { href: '/admin/modules/inventory/attributes', label: 'Attributes', icon: ListCollapse },
        { href: '/admin/modules/inventory/attribute-values', label: 'Attribute Values', icon: ListPlus },
      ]
    },
    { key: 'tableManagement', label: 'Table Management', icon: LayoutGrid, href: '/admin/modules/tableManagement',
      subLinks: [
        { href: '/admin/modules/tableManagement/floors', label: 'Manage Floors', icon: Layers },
        { href: '/admin/modules/tableManagement/configure', label: 'Configure Layout', icon: Map },
      ]
    },
    { key: 'costManagement', label: 'Cost Management', icon: DollarSign, href: '/admin/modules/costManagement',
      subLinks: [
        { href: '/admin/modules/costManagement/suppliers', label: 'Suppliers', icon: Truck },
        { href: '/admin/modules/costManagement/items', label: 'Raw Materials', icon: ShoppingBasket },
        { href: '/admin/modules/costManagement/expenses', label: 'Record Bill', icon: ClipboardList },
        { href: '/admin/modules/costManagement/allBills', label: 'All Bills', icon: List },
        { href: '/admin/modules/costManagement/payments', label: 'Supplier Payments', icon: CreditCard },
        { href: '/admin/modules/costManagement/supplierDueReport', label: 'Due Report', icon: LineChart },
        { href: '/admin/modules/costManagement/categories', label: 'Categories', icon: BarChart3 },
      ]
    },
    { key: 'hrManagement', label: 'HR Management', icon: Users, href: '/admin/modules/hrManagement',
      subLinks: [
        { href: '/admin/modules/hrManagement/employees', label: 'Employees', icon: UserPlus },
        { href: '/admin/modules/hrManagement/designations', label: 'Designations', icon: Briefcase },
      ]
    },
    { key: 'accounting', label: 'Accounting', icon: BookUser, href: '/admin/modules/accounting', 
      subLinks: [
        { href: '/admin/modules/accounting/vouchers', label: 'Vouchers', icon: ReceiptText },
        { href: '/admin/modules/accounting/types', label: 'Account Types', icon: SlidersHorizontal },
        { href: '/admin/modules/accounting/configuration', label: 'Configuration', icon: Cog },
      ]
    },
    { key: 'microfinance', label: 'Microfinance', icon: HandCoins, href: '/admin/modules/microfinance',
      subLinks: [
        { href: '/admin/modules/microfinance/samity', label: 'Samity Management', icon: Users },
        { href: '/admin/modules/microfinance/members', label: 'Members', icon: UserPlus },
        { href: '/admin/modules/microfinance/loan-products', label: 'Loan Products', icon: Package },
        { href: '/admin/modules/microfinance/savings-product-types', label: 'Savings Types', icon: ListChecks },
        { href: '/admin/modules/microfinance/savings-products', label: 'Savings Products', icon: ClipboardList },
        { href: '/admin/modules/microfinance/savings-accounts', label: 'Savings Accounts', icon: Wallet },
        { href: '/admin/modules/microfinance/collections', label: 'Savings Transactions', icon: Receipt },
        { href: '/admin/modules/microfinance/interest', label: 'Savings Interest', icon: Calculator },
        { href: '/admin/modules/microfinance/guarantor', label: 'Guarantor', icon: UserCheck },
        { href: '/admin/modules/microfinance/cash-collateral', label: 'Cash Collateral', icon: Banknote },
        { href: '/admin/modules/microfinance/configuration', label: 'Configuration', icon: Cog },
      ]
    },
    { key: 'fixedAssetManagement', label: 'Fixed Assets', icon: Archive, href: '/admin/modules/fixedAssetManagement',
      subLinks: [
        { href: '/admin/modules/fixedAssetManagement/asset-registration', label: 'Asset Registration', icon: List },
        { href: '/admin/modules/fixedAssetManagement/asset-list', label: 'Asset List', icon: AppWindow },
        { href: '/admin/modules/fixedAssetManagement/asset-categories', label: 'Asset Categories', icon: Milestone },
        { href: '/admin/modules/fixedAssetManagement/locations', label: 'Asset Locations', icon: Locate },
      ]
    },
    { key: 'addressManagement', label: 'Address Data', icon: MapPin, href: '/admin/modules/addressManagement' },
    { key: 'liveAudienceInteraction', label: 'Live Interaction', icon: Vote, href: '/admin/modules/liveAudienceInteraction' },
    { key: 'userAccessControl', label: 'User Access', icon: ShieldCheck, href: '/admin/modules/userAccessControl' },
];


export function Sidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  const renderLink = (link: any, isSubLink = false) => {
    const isActive = pathname === link.href;
    const isParentActive = link.subLinks?.some((sl: any) => pathname.startsWith(sl.href));

    return (
       <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            isSubLink && 'pl-10',
            (isActive || (isParentActive && !isSubLink)) && 'bg-muted text-primary'
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
    )
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="">Restaurant OS</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {mainNavLinks.map((link) => renderLink(link))}
            <div className="my-4 h-[1px] w-full bg-border" />
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase">Modules</h3>
            {moduleLinks.map((link) => {
                const moduleKey = link.key as keyof typeof settings.modules;
                if (moduleKey && !settings.modules[moduleKey]) return null;

                if (link.subLinks) {
                  return (
                    <React.Fragment key={link.key}>
                      {renderLink(link)}
                      {link.subLinks.map(subLink => renderLink(subLink, true))}
                    </React.Fragment>
                  )
                }
                return renderLink(link);
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
