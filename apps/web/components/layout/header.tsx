'use client';

import { useState } from 'react';
import { Brain, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationMenu } from '@/components/layout/navigation-menu';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = false }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header
        data-sidebar-collapsed={sidebarCollapsed}
        className="fixed top-0 right-0 left-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:left-[var(--sidebar-offset)]"
      >
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="打开导航菜单"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="text-base font-semibold text-foreground md:text-lg">AI 研究平台</h1>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="text-sm text-muted-foreground">
              2026年4月12日
            </div>
          </div>
        </div>
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-[88vw] max-w-xs border-r border-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle className="flex items-center gap-3 text-sidebar-foreground">
              <Brain className="h-5 w-5 text-primary" />
              <span>AI 研究平台</span>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-3 py-4">
            <NavigationMenu mode="mobile" onItemClick={() => setMobileNavOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
