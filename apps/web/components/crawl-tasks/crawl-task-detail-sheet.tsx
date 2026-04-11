"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrawlTask } from "@/types/crawl-tasks";
import {
  Clock,
  Database,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  PauseCircle,
  Calendar,
  Hash,
  Copy,
} from "lucide-react";

interface CrawlTaskDetailSheetProps {
  task: CrawlTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"; icon: React.ElementType }> = {
  pending: { label: "等待中", variant: "outline", icon: Clock },
  running: { label: "进行中", variant: "default", icon: Loader2 },
  completed: { label: "已完成", variant: "secondary", icon: CheckCircle2 },
  failed: { label: "失败", variant: "destructive", icon: AlertCircle },
  cancelled: { label: "已取消", variant: "ghost", icon: XCircle },
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
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours} 小时 ${minutes % 60} 分钟`;
  if (minutes > 0) return `${minutes} 分钟 ${seconds % 60} 秒`;
  return `${seconds} 秒`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function CrawlTaskDetailSheet({ task, open, onOpenChange }: CrawlTaskDetailSheetProps) {
  if (!task) return null;

  const config = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const taskTypeLabel = taskTypeLabels[task.task_type] || task.task_type;
  const duration = formatDuration(task.started_at, task.completed_at);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            任务详情
          </SheetTitle>
          <SheetDescription>
            查看抓取任务的完整信息和执行日志。
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">基本信息</TabsTrigger>
              <TabsTrigger value="logs" className="flex-1">执行日志</TabsTrigger>
            </TabsList>

            {/* 基本信息 */}
            <TabsContent value="info" className="mt-4 space-y-4">
              {/* 状态卡片 */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-lg p-2.5",
                      task.status === "running" && "bg-primary/20",
                      task.status === "completed" && "bg-emerald-500/20",
                      task.status === "failed" && "bg-destructive/20",
                      task.status === "pending" && "bg-amber-500/20",
                      task.status === "cancelled" && "bg-gray-500/20",
                    )}>
                      <StatusIcon className={cn(
                        "h-5 w-5",
                        task.status === "running" && "text-primary animate-spin",
                        task.status === "completed" && "text-emerald-400",
                        task.status === "failed" && "text-destructive",
                        task.status === "pending" && "text-amber-400",
                        task.status === "cancelled" && "text-gray-400",
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{taskTypeLabel}</p>
                    </div>
                  </div>
                  <Badge variant={config.variant} className="gap-1">
                    <StatusIcon className={cn("h-3 w-3", task.status === "running" && "animate-spin")} />
                    {config.label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* 详细信息 */}
              <div className="space-y-3">
                <DetailItem
                  icon={Hash}
                  label="任务 ID"
                  value={task.id}
                  copyable
                />
                <DetailItem
                  icon={Database}
                  label="数据源 ID"
                  value={task.source_id}
                  copyable
                />
                <DetailItem
                  icon={FileText}
                  label="任务类型"
                  value={taskTypeLabel}
                />
                <DetailItem
                  icon={Hash}
                  label="记录数"
                  value={task.records_count.toLocaleString()}
                />
                <DetailItem
                  icon={Calendar}
                  label="创建时间"
                  value={formatDateTime(task.created_at)}
                />
                <DetailItem
                  icon={Clock}
                  label="开始时间"
                  value={formatDateTime(task.started_at)}
                />
                <DetailItem
                  icon={CheckCircle2}
                  label="完成时间"
                  value={formatDateTime(task.completed_at)}
                />
                <DetailItem
                  icon={Clock}
                  label="执行时长"
                  value={duration}
                />
                <DetailItem
                  icon={Calendar}
                  label="更新时间"
                  value={formatDateTime(task.updated_at)}
                />
              </div>

              {/* 错误信息 */}
              {task.error_message && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      错误信息
                    </div>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <pre className="whitespace-pre-wrap text-xs text-destructive">
                        {task.error_message}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* 执行日志 */}
            <TabsContent value="logs" className="mt-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-2">
                  <LogEntry
                    time={formatDateTime(task.created_at)}
                    level="info"
                    message="任务已创建，等待执行"
                  />
                  {task.started_at && (
                    <LogEntry
                      time={formatDateTime(task.started_at)}
                      level="info"
                      message="任务开始执行"
                    />
                  )}
                  {task.status === "running" && (
                    <LogEntry
                      time={formatDateTime(task.updated_at)}
                      level="info"
                      message={`正在抓取数据... 已获取 ${task.records_count} 条记录`}
                    />
                  )}
                  {task.status === "completed" && (
                    <LogEntry
                      time={formatDateTime(task.completed_at)}
                      level="success"
                      message={`任务完成，共抓取 ${task.records_count} 条记录`}
                    />
                  )}
                  {task.status === "failed" && (
                    <LogEntry
                      time={formatDateTime(task.completed_at || task.updated_at)}
                      level="error"
                      message={task.error_message || "任务执行失败"}
                    />
                  )}
                  {task.status === "cancelled" && (
                    <LogEntry
                      time={formatDateTime(task.updated_at)}
                      level="warning"
                      message="任务已被取消"
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
}

function DetailItem({ icon: Icon, label, value, copyable }: DetailItemProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">{value}</span>
        {copyable && (
          <button
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => copyToClipboard(value)}
            title="复制"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface LogEntryProps {
  time: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

const levelStyles: Record<string, string> = {
  info: "text-blue-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-destructive",
};

const levelLabels: Record<string, string> = {
  info: "INFO",
  success: "OK",
  warning: "WARN",
  error: "ERROR",
};

function LogEntry({ time, level, message }: LogEntryProps) {
  return (
    <div className="flex items-start gap-2 text-xs font-mono">
      <span className="shrink-0 text-muted-foreground">{time}</span>
      <span className={cn("shrink-0 font-medium", levelStyles[level])}>
        [{levelLabels[level]}]
      </span>
      <span className="text-foreground">{message}</span>
    </div>
  );
}
