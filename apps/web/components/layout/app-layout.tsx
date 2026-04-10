'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mainContentMarginLeft = sidebarCollapsed ? '64px' : '240px';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className="pt-14 transition-all duration-300"
        style={{ marginLeft: mainContentMarginLeft }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}