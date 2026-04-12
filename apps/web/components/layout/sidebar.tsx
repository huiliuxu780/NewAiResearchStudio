'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationMenu } from '@/components/layout/navigation-menu';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {

  const sidebarWidth = collapsed ? '64px' : '240px';

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-sidebar transition-all duration-300 md:flex',
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
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-border" />

      <ScrollArea className="flex-1 px-2 py-4">
        <NavigationMenu collapsed={collapsed} />
      </ScrollArea>

      <Separator className="bg-border" />

      <div className="p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60">
            <p>版本 1.0.0</p>
            <p>最后更新: 2026-04-12</p>
          </div>
        )}
      </div>
    </div>
  );
}
