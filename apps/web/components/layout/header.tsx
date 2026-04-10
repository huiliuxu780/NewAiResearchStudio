'use client';

import { Brain } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = false }: HeaderProps) {
  const marginLeft = sidebarCollapsed ? '64px' : '240px';

  return (
    <header
      className="fixed top-0 right-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ marginLeft }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">AI 研究平台</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            2026年4月10日
          </div>
        </div>
      </div>
    </header>
  );
}