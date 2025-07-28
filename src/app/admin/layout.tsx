
'use client';

import React from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { usePathname } from 'next/navigation';
import { PageTransitionProvider } from '@/components/common/PageTransitionProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPosOrderEntry = pathname === '/admin/modules/pos/orderEntry';

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {isPosOrderEntry ? (
            // Render POS order entry without the transition provider to prevent shaking
            children
          ) : (
            // Wrap other pages with the transition for smooth navigation
            <PageTransitionProvider>{children}</PageTransitionProvider>
          )}
        </main>
      </div>
    </div>
  );
}
