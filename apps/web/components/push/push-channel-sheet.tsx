"use client";

import { AlertTriangle, Copy, Globe, PencilLine, RadioTower, Search, Settings2, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PushChannel, PushTask } from "@/types/push";
import { PushDetailRow, formatDateTime, formatJson, getChannelTypeLabel } from "@/components/push/push-shared";

export function PushChannelSheet({
  channel,
  open,
  onOpenChange,
  dependentTasks,
  onEditChannel,
  onDuplicateChannel,
  onInspectRecords,
  onInspectTask,
  onInspectRisk,
}: {
  channel: PushChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependentTasks?: PushTask[];
  onEditChannel?: (channel: PushChannel) => void;
  onDuplicateChannel?: (channel: PushChannel) => void;
  onInspectRecords?: (channel: PushChannel) => void;
  onInspectTask?: (task: PushTask) => void;
  onInspectRisk?: () => void;
}) {
  if (!channel) return null;

  const deliveryTasks = (dependentTasks ?? []).filter((task) => task.channel_ids.includes(channel.id));
  const alertTasks = (dependentTasks ?? []).filter((task) => task.alert_channel_id === channel.id && task.alert_on_failure);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <RadioTower className="h-5 w-5" />
            渠道详情
          </SheetTitle>
          <SheetDescription>查看推送渠道配置与当前状态。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onEditChannel?.(channel)}>
                <PencilLine className="h-3.5 w-3.5" />
                编辑渠道
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDuplicateChannel?.(channel)}>
                <Copy className="h-3.5 w-3.5" />
                复制渠道
              </Button>
              <Button size="sm" variant="outline" onClick={() => onInspectRecords?.(channel)}>
                <Search className="h-3.5 w-3.5" />
                查看记录
              </Button>
              {!channel.is_enabled && (
                <Button size="sm" variant="secondary" onClick={() => onInspectRisk?.()}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  查看依赖风险
                </Button>
              )}
            </div>

            <PushDetailRow icon={RadioTower} label="渠道名称" value={channel.name} />
            <PushDetailRow icon={Globe} label="渠道类型" value={getChannelTypeLabel(channel.channel_type)} />
            <PushDetailRow icon={ToggleLeft} label="启用状态" value={channel.is_enabled ? "已启用" : "已停用"} />
            <PushDetailRow icon={Settings2} label="更新时间" value={formatDateTime(channel.updated_at)} />

            {(deliveryTasks.length || alertTasks.length) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">依赖任务</p>

                  {deliveryTasks.length ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-sky-500/20 bg-sky-500/10 text-sky-400">
                          发送链路 {deliveryTasks.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {deliveryTasks.map((task) => (
                          <Button key={task.id} size="sm" variant="outline" onClick={() => onInspectTask?.(task)}>
                            {task.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {alertTasks.length ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                          告警链路 {alertTasks.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {alertTasks.map((task) => (
                          <Button key={task.id} size="sm" variant="outline" onClick={() => onInspectTask?.(task)}>
                            {task.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {channel.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">描述</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {channel.description}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">配置 JSON</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {formatJson(channel.config)}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
