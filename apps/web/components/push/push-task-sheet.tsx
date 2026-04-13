"use client";

import { BellRing, Clock3, Copy, Filter, PencilLine, Play, Repeat, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PushChannel, PushTask, PushTemplate } from "@/types/push";
import { PushDetailRow, PushStatusBadge, formatDateTime, formatJson, getChannelTypeLabel, getTriggerTypeLabel } from "@/components/push/push-shared";

export function PushTaskSheet({
  task,
  open,
  onOpenChange,
  channels,
  templates,
  onEditTask,
  onDuplicateTask,
  onInspectRecords,
  onInspectChannel,
  onInspectTemplate,
  onTriggerTask,
}: {
  task: PushTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels?: PushChannel[];
  templates?: PushTemplate[];
  onEditTask?: (task: PushTask) => void;
  onDuplicateTask?: (task: PushTask) => void;
  onInspectRecords?: (task: PushTask) => void;
  onInspectChannel?: (channel: PushChannel) => void;
  onInspectTemplate?: (template: PushTemplate) => void;
  onTriggerTask?: (task: PushTask) => void;
}) {
  if (!task) return null;

  const linkedChannels = (channels ?? []).filter((channel) => task.channel_ids.includes(channel.id));
  const linkedTemplate = task.template_id ? (templates ?? []).find((template) => template.id === task.template_id) ?? null : null;
  const alertChannel = task.alert_channel_id ? (channels ?? []).find((channel) => channel.id === task.alert_channel_id) ?? null : null;

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

            {(linkedTemplate || linkedChannels.length || alertChannel) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">关联对象</p>

                  {linkedTemplate ? (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{linkedTemplate.name}</p>
                          <p className="text-xs text-muted-foreground">模板 · {linkedTemplate.is_enabled ? "已启用" : "已停用"}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => onInspectTemplate?.(linkedTemplate)}>
                          查看模板
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {linkedChannels.length ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">发送渠道</p>
                      <div className="flex flex-wrap gap-2">
                        {linkedChannels.map((channel) => (
                          <Button key={channel.id} size="sm" variant="outline" onClick={() => onInspectChannel?.(channel)}>
                            {channel.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {alertChannel ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                          告警渠道
                        </Badge>
                        <p className="text-sm font-medium text-foreground">{alertChannel.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{getChannelTypeLabel(alertChannel.channel_type)}</p>
                      <Button size="sm" variant="outline" onClick={() => onInspectChannel?.(alertChannel)}>
                        查看告警渠道
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            )}

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
