"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CrawlTaskStats } from "@/types/crawl-tasks";
import {
  ListTodo,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
} from "lucide-react";

interface CrawlTaskStatsProps {
  stats?: CrawlTaskStats;
  isLoading?: boolean;
  className?: string;
}

interface StatItem {
  key: keyof CrawlTaskStats;
  label: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

const statItems: StatItem[] = [
  {
    key: "total",
    label: "总任务数",
    icon: ListTodo,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    key: "running",
    label: "进行中",
    icon: Loader2,
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    key: "completed",
    label: "已完成",
    icon: CheckCircle2,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    key: "failed",
    label: "失败",
    icon: AlertTriangle,
    gradient: "from-red-500/10 via-red-500/5 to-transparent",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
  {
    key: "pending",
    label: "等待中",
    icon: Clock,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    key: "cancelled",
    label: "已取消",
    icon: Ban,
    gradient: "from-gray-500/10 via-gray-500/5 to-transparent",
    iconBg: "bg-gray-500/20",
    iconColor: "text-gray-400",
  },
];

export function CrawlTaskStatsCard({ stats, isLoading, className }: CrawlTaskStatsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats ? stats[item.key] : 0;

        return (
          <Card
            key={item.key}
            className={cn(
              "relative overflow-hidden border-0 bg-gradient-to-br transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
              item.gradient
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {isLoading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
                    ) : (
                      typeof value === "number" ? value.toLocaleString() : value
                    )}
                  </p>
                </div>
                <div className={cn("rounded-lg p-2.5", item.iconBg)}>
                  <Icon className={cn("h-5 w-5", item.iconColor, item.key === "running" && "animate-spin")} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
