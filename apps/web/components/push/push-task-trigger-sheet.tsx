"use client";

import { useMemo, useState } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getTriggerTypeLabel } from "@/components/push/push-shared";
import type { PushChannel, PushTask, PushTemplate, TriggerPushTaskData } from "@/types/push";

export function PushTaskTriggerSheet({
  task,
  channels,
  templates,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: {
  task: PushTask | null;
  channels: PushChannel[];
  templates: PushTemplate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TriggerPushTaskData) => void;
  isSubmitting?: boolean;
}) {
  const formKey = `${task?.id ?? "none"}-${open ? "open" : "closed"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl">
        <PushTaskTriggerForm
          key={formKey}
          task={task}
          channels={channels}
          templates={templates}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </SheetContent>
    </Sheet>
  );
}

function PushTaskTriggerForm({
  task,
  channels,
  templates,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  task: PushTask | null;
  channels: PushChannel[];
  templates: PushTemplate[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TriggerPushTaskData) => void;
  isSubmitting: boolean;
}) {
  const linkedTemplate = useMemo(
    () => templates.find((template) => template.id === task?.template_id) ?? null,
    [task?.template_id, templates]
  );
  const [channelIds, setChannelIds] = useState<string[]>(task?.channel_ids ?? []);
  const [variablesText, setVariablesText] = useState(
    JSON.stringify(linkedTemplate?.default_values ?? {}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!task) {
    return null;
  }

  function toggleChannel(channelId: string) {
    setChannelIds((current) =>
      current.includes(channelId) ? current.filter((item) => item !== channelId) : [...current, channelId]
    );
  }

  function handleSubmit() {
    setJsonError(null);

    try {
      const templateVariables = parseVariablesJson(variablesText);
      onSubmit({
        channel_ids: channelIds.length ? channelIds : undefined,
        template_variables: templateVariables,
      });
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "触发参数 JSON 格式不正确");
    }
  }

  return (
    <>
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle>调试触发任务</SheetTitle>
        <SheetDescription>不改任务定义，直接带参数执行一轮推送，适合验证模板变量、渠道路由和落库结果。</SheetDescription>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-9rem)] px-6 py-5">
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{getTriggerTypeLabel(task.trigger_type)}</Badge>
              {linkedTemplate && <Badge variant="outline">模板: {linkedTemplate.name}</Badge>}
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">{task.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{task.description || "当前任务暂无额外描述。"}</p>
          </div>

          <div className="space-y-3">
            <Label>覆盖发送渠道</Label>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const selected = channelIds.includes(channel.id);
                return (
                  <Button
                    key={channel.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel(channel.id)}
                  >
                    {channel.name}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">默认会使用任务自身绑定的渠道；在这里可以临时改成本次调试用的路由。</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-task-trigger-variables">
              {task.trigger_type === "event_triggered" ? "事件载荷 / 模板变量 JSON" : "模板变量 JSON"}
            </Label>
            <Textarea
              id="push-task-trigger-variables"
              value={variablesText}
              onChange={(event) => setVariablesText(event.target.value)}
              className="min-h-56 font-mono text-xs"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              {task.trigger_type === "event_triggered"
                ? "事件触发任务会把这里的 JSON 当成 event payload 注入模板和执行逻辑。"
                : "这里的变量会覆盖模板默认值，用来验证不同消息场景。"}
            </p>
          </div>

          {jsonError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {jsonError}
            </div>
          )}

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <p>执行后会自动跳到记录 tab，并按当前任务聚焦结果，方便我们立刻核对发送记录和失败原因。</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter className="border-t px-6 py-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              触发中...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              执行触发
            </>
          )}
        </Button>
      </SheetFooter>
    </>
  );
}

function parseVariablesJson(value: string) {
  const parsed = value.trim() ? JSON.parse(value) : {};
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("触发参数必须是 JSON 对象。");
  }
  return parsed as Record<string, unknown>;
}
