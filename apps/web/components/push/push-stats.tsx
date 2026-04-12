"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Activity, BellRing, CheckCircle2, Send } from "lucide-react";
import { PushStats } from "@/types/push";
import { formatPercent } from "@/components/push/push-shared";

export function PushStatsCards({ stats, isLoading }: { stats?: PushStats; isLoading?: boolean }) {
  const summary = stats?.summary;

  const items = [
    {
      key: "total_tasks",
      label: "总任务数",
      value: summary?.total_tasks ?? 0,
      icon: BellRing,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    },
    {
      key: "enabled_tasks",
      label: "启用任务",
      value: summary?.enabled_tasks ?? 0,
      icon: Activity,
      color: "text-violet-400",
      bg: "bg-violet-500/15",
      gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    },
    {
      key: "total_records",
      label: "总推送记录",
      value: summary?.total_records ?? 0,
      icon: Send,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      key: "success_rate",
      label: "成功率",
      value: formatPercent(summary?.success_rate ?? 0),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key} className={`border-border/40 bg-gradient-to-br ${item.gradient}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${item.bg}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-semibold font-mono text-foreground">
                    {isLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-muted" /> : item.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
