"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getTriggerTypeLabel } from "@/components/push/push-shared";
import type {
  PushChannel,
  PushTask,
  PushTaskCreateData,
  PushTaskUpdateData,
  PushTemplate,
} from "@/types/push";

const triggerOptions = [
  { value: "scheduled", label: "定时触发" },
  { value: "event_triggered", label: "事件触发" },
  { value: "manual", label: "手动触发" },
];

export function PushTaskEditorSheet({
  task,
  initialTask,
  channels,
  templates,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: {
  task: PushTask | null;
  initialTask?: PushTask | null;
  channels: PushChannel[];
  templates: PushTemplate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PushTaskCreateData | PushTaskUpdateData) => void;
  isSaving?: boolean;
}) {
  const formKey = `${task?.id ?? `copy-${initialTask?.id ?? "new"}`}-${open ? "open" : "closed"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-2xl">
        <PushTaskEditorForm
          key={formKey}
          task={task}
          initialTask={initialTask}
          channels={channels}
          templates={templates}
          onOpenChange={onOpenChange}
          onSave={onSave}
          isSaving={isSaving}
        />
      </SheetContent>
    </Sheet>
  );
}

function PushTaskEditorForm({
  task,
  initialTask,
  channels,
  templates,
  onOpenChange,
  onSave,
  isSaving,
}: {
  task: PushTask | null;
  initialTask?: PushTask | null;
  channels: PushChannel[];
  templates: PushTemplate[];
  onOpenChange: (open: boolean) => void;
  onSave: (data: PushTaskCreateData | PushTaskUpdateData) => void;
  isSaving: boolean;
}) {
  const isEditing = Boolean(task);
  const sourceTask = task ?? initialTask ?? null;
  const [name, setName] = useState(task?.name ?? (initialTask ? `${initialTask.name} - 副本` : ""));
  const [description, setDescription] = useState(sourceTask?.description ?? "");
  const [triggerType, setTriggerType] = useState(sourceTask?.trigger_type ?? "scheduled");
  const [cronExpression, setCronExpression] = useState(sourceTask?.cron_expression ?? "");
  const [scheduleConfigText, setScheduleConfigText] = useState(JSON.stringify(sourceTask?.schedule_config ?? {}, null, 2));
  const [channelIds, setChannelIds] = useState<string[]>(sourceTask?.channel_ids ?? []);
  const [templateId, setTemplateId] = useState(sourceTask?.template_id ?? "__none__");
  const [maxRetries, setMaxRetries] = useState(String(sourceTask?.max_retries ?? 3));
  const [retryInterval, setRetryInterval] = useState(String(sourceTask?.retry_interval ?? 60));
  const [eventType, setEventType] = useState(sourceTask?.event_type ?? "");
  const [eventFiltersText, setEventFiltersText] = useState(JSON.stringify(sourceTask?.event_filters ?? {}, null, 2));
  const [contentConfigText, setContentConfigText] = useState(JSON.stringify(sourceTask?.content_config ?? {}, null, 2));
  const [alertOnFailure, setAlertOnFailure] = useState(sourceTask?.alert_on_failure ?? true);
  const [alertChannelId, setAlertChannelId] = useState(sourceTask?.alert_channel_id ?? "__none__");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    const hasCore = Boolean(name.trim() && channelIds.length > 0);
    if (!hasCore) return false;
    if (triggerType === "scheduled" && !cronExpression.trim()) return false;
    if (triggerType === "event_triggered" && !eventType.trim()) return false;
    return true;
  }, [channelIds.length, cronExpression, eventType, name, triggerType]);

  function toggleChannelId(channelId: string) {
    setChannelIds((current) =>
      current.includes(channelId) ? current.filter((item) => item !== channelId) : [...current, channelId]
    );
  }

  function handleSave() {
    setJsonError(null);

    try {
      const scheduleConfig = parseNullableJsonObject(scheduleConfigText);
      const eventFilters = parseNullableJsonObject(eventFiltersText);
      const contentConfig = parseRequiredJsonObject(contentConfigText, "内容配置必须是 JSON 对象。");
      const retryCount = Number.parseInt(maxRetries, 10);
      const retrySeconds = Number.parseInt(retryInterval, 10);

      if (Number.isNaN(retryCount) || retryCount < 0 || retryCount > 10) {
        throw new Error("最大重试次数必须是 0 到 10 之间的整数。");
      }

      if (Number.isNaN(retrySeconds) || retrySeconds < 10) {
        throw new Error("重试间隔必须是不小于 10 的整数秒。");
      }

      if (isEditing) {
        const payload: PushTaskUpdateData = {
          name: name.trim(),
          description: description.trim() || null,
          cron_expression: task?.trigger_type === "scheduled" ? cronExpression.trim() || null : undefined,
          schedule_config: task?.trigger_type === "scheduled" ? scheduleConfig : undefined,
          channel_ids: channelIds,
          template_id: templateId === "__none__" ? null : templateId,
          max_retries: retryCount,
          retry_interval: retrySeconds,
          event_filters: task?.trigger_type === "event_triggered" ? eventFilters : undefined,
          content_config: contentConfig,
          alert_on_failure: alertOnFailure,
          alert_channel_id: alertOnFailure && alertChannelId !== "__none__" ? alertChannelId : null,
        };
        onSave(payload);
        return;
      }

      const payload: PushTaskCreateData = {
        name: name.trim(),
        description: description.trim() || null,
        trigger_type: triggerType,
        cron_expression: triggerType === "scheduled" ? cronExpression.trim() || null : null,
        schedule_config: triggerType === "scheduled" ? scheduleConfig : null,
        channel_ids: channelIds,
        template_id: templateId === "__none__" ? null : templateId,
        max_retries: retryCount,
        retry_interval: retrySeconds,
        event_type: triggerType === "event_triggered" ? eventType.trim() || null : null,
        event_filters: triggerType === "event_triggered" ? eventFilters : null,
        content_config: contentConfig,
        alert_on_failure: alertOnFailure,
        alert_channel_id: alertOnFailure && alertChannelId !== "__none__" ? alertChannelId : null,
      };
      onSave(payload);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "任务配置填写有误");
    }
  }

  return (
    <>
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle>{isEditing ? "编辑推送任务" : initialTask ? "复制推送任务" : "新建推送任务"}</SheetTitle>
        <SheetDescription>
          {isEditing
            ? "调整任务执行配置、渠道路由和失败告警。"
            : initialTask
              ? "基于现有任务快速生成一个副本，再按需微调。"
              : "创建新的推送任务，绑定模板、触发方式和渠道。"}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-9rem)] px-6 py-5">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="push-task-name">任务名称</Label>
            <Input id="push-task-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：日报生成完成通知" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-task-description">描述</Label>
            <Textarea
              id="push-task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="说明任务适用的业务场景"
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-task-trigger-type">触发方式</Label>
            {isEditing ? (
              <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground">
                {getTriggerTypeLabel(task?.trigger_type ?? triggerType)}
              </div>
            ) : (
              <Select value={triggerType} onValueChange={(value) => setTriggerType(value ?? "scheduled")}>
                <SelectTrigger id="push-task-trigger-type">
                  <SelectValue placeholder="选择触发方式" />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isEditing && <p className="text-xs text-muted-foreground">任务创建后不再变更触发骨架，避免和调度/事件绑定状态脱节。</p>}
          </div>

          {(triggerType === "scheduled" || task?.trigger_type === "scheduled") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="push-task-cron">Cron 表达式</Label>
                <Input
                  id="push-task-cron"
                  value={cronExpression}
                  onChange={(event) => setCronExpression(event.target.value)}
                  placeholder="例如：0 9 * * 1-5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="push-task-schedule-config">调度配置 JSON</Label>
                <Textarea
                  id="push-task-schedule-config"
                  value={scheduleConfigText}
                  onChange={(event) => setScheduleConfigText(event.target.value)}
                  className="min-h-28 font-mono text-xs"
                  spellCheck={false}
                />
              </div>
            </>
          )}

          {(triggerType === "event_triggered" || task?.trigger_type === "event_triggered") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="push-task-event-type">事件类型</Label>
                {isEditing ? (
                  <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground">
                    {task?.event_type || "-"}
                  </div>
                ) : (
                  <Input
                    id="push-task-event-type"
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value)}
                    placeholder="例如：report.generated"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="push-task-event-filters">事件过滤 JSON</Label>
                <Textarea
                  id="push-task-event-filters"
                  value={eventFiltersText}
                  onChange={(event) => setEventFiltersText(event.target.value)}
                  className="min-h-28 font-mono text-xs"
                  spellCheck={false}
                />
              </div>
            </>
          )}

          <div className="space-y-3">
            <Label>目标渠道</Label>
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => {
                const selected = channelIds.includes(channel.id);
                return (
                  <Button
                    key={channel.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannelId(channel.id)}
                  >
                    {channel.name}
                  </Button>
                );
              })}
            </div>
            {!channels.length && <p className="text-xs text-muted-foreground">暂无渠道数据，请先在渠道 tab 完成创建。</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-task-template">关联模板</Label>
            <Select value={templateId} onValueChange={(value) => setTemplateId(value ?? "__none__")}>
              <SelectTrigger id="push-task-template">
                <SelectValue placeholder="选择模板" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">不绑定模板</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="push-task-max-retries">最大重试次数</Label>
              <Input
                id="push-task-max-retries"
                type="number"
                min={0}
                max={10}
                value={maxRetries}
                onChange={(event) => setMaxRetries(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="push-task-retry-interval">重试间隔（秒）</Label>
              <Input
                id="push-task-retry-interval"
                type="number"
                min={10}
                value={retryInterval}
                onChange={(event) => setRetryInterval(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-task-content-config">内容配置 JSON</Label>
            <Textarea
              id="push-task-content-config"
              value={contentConfigText}
              onChange={(event) => setContentConfigText(event.target.value)}
              className="min-h-32 font-mono text-xs"
              spellCheck={false}
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">失败告警</p>
                <p className="mt-1 text-xs text-muted-foreground">任务执行失败时，自动通过指定渠道通知人工处理。</p>
              </div>
              <Switch checked={alertOnFailure} onCheckedChange={setAlertOnFailure} />
            </div>

            {alertOnFailure && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="push-task-alert-channel">告警渠道</Label>
                <Select value={alertChannelId} onValueChange={(value) => setAlertChannelId(value ?? "__none__")}>
                  <SelectTrigger id="push-task-alert-channel">
                    <SelectValue placeholder="选择告警渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">不指定</SelectItem>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {jsonError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {jsonError}
            </div>
          )}
        </div>
      </ScrollArea>

      <SheetFooter className="border-t px-6 py-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={!isFormValid || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isEditing ? "保存变更" : "创建任务"}
            </>
          )}
        </Button>
      </SheetFooter>
    </>
  );
}

function parseNullableJsonObject(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("任务扩展配置必须是 JSON 对象。");
  }
  return parsed as Record<string, unknown>;
}

function parseRequiredJsonObject(value: string, message: string) {
  const parsed = value.trim() ? JSON.parse(value) : {};
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(message);
  }
  return parsed as Record<string, unknown>;
}
