'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellRing, Brain, Calendar, CheckCircle, Database, FileText, FolderOpen, Globe, LayoutDashboard, Lightbulb, MessageSquare, Package, ScrollText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navGroups, type NavItem } from '@/types/labels';

interface NavigationMenuProps {
  collapsed?: boolean;
  mode?: 'desktop' | 'mobile';
  onItemClick?: () => void;
}

const iconMap = {
  dashboard: LayoutDashboard,
  reports: Calendar,
  logs: ScrollText,
  sources: Database,
  tasks: Globe,
  'raw-records': FileText,
  facts: CheckCircle,
  insights: Lightbulb,
  models: Brain,
  products: Package,
  topics: FolderOpen,
  prompts: MessageSquare,
  push: BellRing,
  settings: Settings,
} as const satisfies Record<NavItem['key'], React.ComponentType<{ className?: string }>>;

function isItemActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

export function NavigationMenu({
  collapsed = false,
  mode = 'desktop',
  onItemClick,
}: NavigationMenuProps) {
  const pathname = usePathname();
  const isMobile = mode === 'mobile';
  const showGroupLabel = isMobile || !collapsed;

  return (
    <nav className={cn('flex flex-col', isMobile ? 'gap-5' : 'gap-4')}>
      {navGroups.map((group) => {
        const groupIsActive = group.items.some((item) => isItemActive(pathname, item.href));

        return (
          <div
            key={group.key}
            className={cn(
              'space-y-1',
              !showGroupLabel && 'space-y-2',
            )}
          >
            {showGroupLabel && (
              <p
                className={cn(
                  'px-3 text-[11px] font-medium uppercase tracking-[0.18em]',
                  groupIsActive ? 'text-sidebar-foreground/70' : 'text-sidebar-foreground/40'
                )}
              >
                {group.label}
              </p>
            )}

            <div className={cn('space-y-1', !showGroupLabel && 'space-y-2')}>
              {group.items.map((item) => {
                const isActive = isItemActive(pathname, item.href);
                const Icon = iconMap[item.key];

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={!showGroupLabel ? item.label : undefined}
                    onClick={onItemClick}
                    className={cn(
                      'flex items-center gap-3 rounded-xl text-sm transition-colors duration-200',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
                        : 'text-sidebar-foreground/80',
                      isMobile ? 'px-3 py-2.5' : 'px-3 py-2',
                      collapsed && !isMobile && 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {showGroupLabel && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
