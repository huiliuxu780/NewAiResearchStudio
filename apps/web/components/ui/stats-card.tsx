"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/50 to-primary/10" />
      </CardContent>
    </Card>
  );
}