'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/types/labels';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Database,
  FileText,
  CheckCircle,
  Lightbulb,
  Brain,
  Package,
  FolderOpen,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, React.ReactNode> = {
  'dashboard': <LayoutDashboard className="h-4 w-4" />,
  'sources': <Database className="h-4 w-4" />,
  'raw-records': <FileText className="h-4 w-4" />,
  'facts': <CheckCircle className="h-4 w-4" />,
  'insights': <Lightbulb className="h-4 w-4" />,
  'models': <Brain className="h-4 w-4" />,
  'products': <Package className="h-4 w-4" />,
  'topics': <FolderOpen className="h-4 w-4" />,
  'week-reports': <Calendar className="h-4 w-4" />,
  'settings': <Settings className="h-4 w-4" />,
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300',
        'flex flex-col'
      )}
      style={{ width: sidebarWidth }}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-semibold text-sidebar-foreground">AI 研究平台</span>
          </div>
        )}
        {collapsed && <Brain className="h-6 w-6 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-border" />

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                {iconMap[item.key]}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-border" />

      <div className="p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60">
            <p>版本 1.0.0</p>
            <p>最后更新: 2026-04-10</p>
          </div>
        )}
      </div>
    </div>
  );
}