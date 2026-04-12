"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CrawlTask } from "@/types/crawl-tasks";
import {
  Clock,
  Database,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  Eye,
  Ban,
} from "lucide-react";

interface CrawlTaskCardProps {
  task: CrawlTask;
  onViewDetail: (task: CrawlTask) => void;
  onCancel?: (task: CrawlTask) => void;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"; icon: React.ElementType }> = {
  pending: {
    label: "等待中",
    variant: "outline",
    icon: Clock,
  },
  running: {
    label: "进行中",
    variant: "default",
    icon: Loader2,
  },
  completed: {
    label: "已完成",
    variant: "secondary",
    icon: CheckCircle2,
  },
  failed: {
    label: "失败",
    variant: "destructive",
    icon: AlertCircle,
  },
  cancelled: {
    label: "已取消",
    variant: "ghost",
    icon: XCircle,
  },
};

const taskTypeLabels: Record<string, string> = {
  full: "全量抓取",
  incremental: "增量抓取",
  retry: "重试抓取",
};

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  return `${diffDays} 天前`;
}

export function CrawlTaskCard({ task, onViewDetail, onCancel, className }: CrawlTaskCardProps) {
  const config = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const isCancelable = task.status === "pending" || task.status === "running";
  const taskTypeLabel = taskTypeLabels[task.task_type] || task.task_type;

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "group/card transition-all duration-200 hover:ring-1 hover:ring-primary/20",
          task.status === "running" && "ring-1 ring-primary/30",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 truncate">
                <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-mono">{task.source_id}</span>
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {taskTypeLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  创建于 {formatRelativeTime(task.created_at)}
                </span>
              </CardDescription>
            </div>
            <Badge
              variant={config.variant}
              className={cn(
                "shrink-0 gap-1",
                task.status === "running" && "animate-pulse"
              )}
            >
              <StatusIcon className={cn("h-3 w-3", task.status === "running" && "animate-spin")} />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">记录数</span>
              <span className="font-medium text-foreground">{task.records_count.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">开始时间</span>
              <span className="font-medium text-foreground">{formatDateTime(task.started_at)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">完成时间</span>
              <span className="font-medium text-foreground">{formatDateTime(task.completed_at)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">任务 ID</span>
              <span className="font-mono text-muted-foreground truncate" title={task.id}>
                {task.id.slice(0, 8)}...
              </span>
            </div>
          </div>

          {task.error_message && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{task.error_message}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetail(task)}
          >
            <Eye className="h-3.5 w-3.5" />
            详情
          </Button>
          {isCancelable && onCancel && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancel(task)}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    取消
                  </Button>
                }
              />
              <TooltipContent>
                <p>取消此任务</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
