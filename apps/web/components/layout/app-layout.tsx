'use client';

import { useState, type CSSProperties } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarOffset = sidebarCollapsed ? '64px' : '240px';
  const layoutStyle = {
    ['--sidebar-offset' as string]: sidebarOffset,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={layoutStyle}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className="pt-14 transition-all duration-300 md:ml-[var(--sidebar-offset)]">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
