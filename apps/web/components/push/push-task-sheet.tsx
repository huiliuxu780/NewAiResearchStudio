"use client";

import { BellRing, Clock3, Copy, Filter, PencilLine, Play, Repeat, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PushTask } from "@/types/push";
import { PushDetailRow, PushStatusBadge, formatDateTime, formatJson, getTriggerTypeLabel } from "@/components/push/push-shared";

export function PushTaskSheet({
  task,
  open,
  onOpenChange,
  onEditTask,
  onDuplicateTask,
  onInspectRecords,
  onTriggerTask,
}: {
  task: PushTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditTask?: (task: PushTask) => void;
  onDuplicateTask?: (task: PushTask) => void;
  onInspectRecords?: (task: PushTask) => void;
  onTriggerTask?: (task: PushTask) => void;
}) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            任务详情
          </SheetTitle>
          <SheetDescription>查看任务状态、调度方式和推送配置。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm text-muted-foreground">当前状态</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{task.name}</p>
              </div>
              <PushStatusBadge status={task.status} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onEditTask?.(task)}>
                <PencilLine className="h-3.5 w-3.5" />
                编辑任务
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDuplicateTask?.(task)}>
                <Copy className="h-3.5 w-3.5" />
                复制任务
              </Button>
              <Button size="sm" variant="outline" onClick={() => onInspectRecords?.(task)}>
                <Send className="h-3.5 w-3.5" />
                查看记录
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onTriggerTask?.(task)}>
                <Play className="h-3.5 w-3.5" />
                立即触发
              </Button>
            </div>

            <PushDetailRow icon={Send} label="触发方式" value={getTriggerTypeLabel(task.trigger_type)} />
            <PushDetailRow icon={Clock3} label="最近执行" value={formatDateTime(task.last_executed_at)} />
            <PushDetailRow icon={Clock3} label="下次执行" value={formatDateTime(task.next_scheduled_at)} />
            <PushDetailRow icon={Repeat} label="最大重试" value={`${task.max_retries} 次 / ${task.retry_interval} 秒`} />
            <PushDetailRow icon={ShieldAlert} label="失败告警" value={task.alert_on_failure ? "开启" : "关闭"} />

            {task.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">描述</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {task.description}
                  </div>
                </div>
              </>
            )}

            {task.event_filters && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Filter className="h-4 w-4" />
                    事件过滤条件
                  </p>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {formatJson(task.event_filters)}
                  </pre>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">内容配置</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {formatJson(task.content_config)}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
