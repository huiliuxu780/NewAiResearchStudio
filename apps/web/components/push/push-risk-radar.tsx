"use client";

import { type ElementType, useMemo } from "react";
import { AlertTriangle, ArrowRight, BellRing, FileText, RadioTower, RefreshCcw } from "lucide-react";
import type { PushRecordDiagnosticFilter, PushTaskRiskFilter } from "@/lib/push-console-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PushChannel, PushStats, PushTask, PushTemplate } from "@/types/push";

export function PushRiskRadar({
  channels,
  stats,
  tasks,
  templates,
  onInspectChannelRisk,
  onInspectTaskRisk,
  onInspectRecordRisk,
  onInspectTemplateRisk,
}: {
  channels: PushChannel[];
  stats?: PushStats;
  tasks: PushTask[];
  templates: PushTemplate[];
  onInspectChannelRisk: () => void;
  onInspectTaskRisk: (filter?: PushTaskRiskFilter) => void;
  onInspectRecordRisk: (filter?: PushRecordDiagnosticFilter) => void;
  onInspectTemplateRisk: () => void;
}) {
  const channelRisk = useMemo(() => {
    const disabledChannelIds = new Set(channels.filter((channel) => !channel.is_enabled).map((channel) => channel.id));
    const impactedTasks = tasks.filter(
      (task) =>
        task.is_enabled &&
        (task.channel_ids.some((channelId) => disabledChannelIds.has(channelId)) ||
          (task.alert_on_failure && !!task.alert_channel_id && disabledChannelIds.has(task.alert_channel_id)))
    );

    return {
      disabledChannelsInUse: channels.filter(
        (channel) =>
          !channel.is_enabled &&
          impactedTasks.some(
            (task) =>
              task.channel_ids.includes(channel.id) || (task.alert_on_failure && task.alert_channel_id === channel.id)
          )
      ),
      impactedTasks,
    };
  }, [channels, tasks]);

  const templateRisk = useMemo(() => {
    const disabledTemplateIds = new Set(templates.filter((template) => !template.is_enabled).map((template) => template.id));
    const impactedTasks = tasks.filter((task) => task.is_enabled && !!task.template_id && disabledTemplateIds.has(task.template_id));

    return {
      disabledTemplatesInUse: templates.filter(
        (template) => !template.is_enabled && impactedTasks.some((task) => task.template_id === template.id)
      ),
      impactedTasks,
    };
  }, [tasks, templates]);

  const recordRiskCount = (stats?.summary.failed_count ?? 0) + (stats?.summary.retrying_count ?? 0);
  const failureTaskRiskCount = tasks.filter((task) => task.is_enabled && task.failure_count > 0).length;
  const taskRisk = useMemo(() => {
    const disabledChannelIds = new Set(channels.filter((channel) => !channel.is_enabled).map((channel) => channel.id));
    const disabledTemplateIds = new Set(templates.filter((template) => !template.is_enabled).map((template) => template.id));

    return tasks.filter(
      (task) =>
        task.is_enabled &&
        (task.failure_count > 0 ||
          (task.template_id ? disabledTemplateIds.has(task.template_id) : false) ||
          task.channel_ids.some((channelId) => disabledChannelIds.has(channelId)))
    );
  }, [channels, tasks, templates]);
  const dependencyTaskRiskCount = useMemo(() => {
    const dependencyIds = new Set([
      ...channelRisk.impactedTasks.map((task) => task.id),
      ...templateRisk.impactedTasks.map((task) => task.id),
    ]);

    return tasks.filter((task) => task.is_enabled && dependencyIds.has(task.id)).length;
  }, [channelRisk.impactedTasks, tasks, templateRisk.impactedTasks]);

  return (
    <Card className="border-border/40 bg-background/60">
      <CardHeader className="flex flex-col gap-3 border-b border-border/50 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle className="text-base">主线风险雷达</CardTitle>
          <CardDescription>先看真正会阻塞发送的对象关系，再决定进入哪个 tab 处理。</CardDescription>
        </div>
        <Badge variant="outline" className="w-fit border-amber-500/20 bg-amber-500/10 text-amber-400">
          BG-101 Mainline
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-4 pt-4 xl:grid-cols-2 2xl:grid-cols-4">
        <RiskCard
          icon={BellRing}
          title="风险任务"
          count={taskRisk.length}
          accentClassName="border-rose-500/20 bg-rose-500/10 text-rose-400"
          description={
            taskRisk.length
              ? `这些启用任务包含失败记录或依赖停用资源。`
              : "当前没有需要优先介入的高风险任务。"
          }
          examples={taskRisk.map((task) => task.name)}
          actionLabel="查看风险任务"
          onAction={onInspectTaskRisk}
          quickActions={[
            { label: `失败风险 ${failureTaskRiskCount}`, onAction: () => onInspectTaskRisk("failing") },
            { label: `依赖风险 ${dependencyTaskRiskCount}`, onAction: () => onInspectTaskRisk("dependency") },
          ]}
        />

        <RiskCard
          icon={RadioTower}
          title="渠道依赖风险"
          count={channelRisk.disabledChannelsInUse.length}
          accentClassName="border-sky-500/20 bg-sky-500/10 text-sky-400"
          description={
            channelRisk.disabledChannelsInUse.length
              ? `有 ${channelRisk.impactedTasks.length} 个启用任务仍依赖停用渠道。`
              : "当前没有启用任务依赖停用渠道。"
          }
          examples={channelRisk.disabledChannelsInUse.map((channel) => channel.name)}
          actionLabel="查看渠道风险"
          onAction={onInspectChannelRisk}
        />

        <RiskCard
          icon={FileText}
          title="模板依赖风险"
          count={templateRisk.disabledTemplatesInUse.length}
          accentClassName="border-violet-500/20 bg-violet-500/10 text-violet-400"
          description={
            templateRisk.disabledTemplatesInUse.length
              ? `有 ${templateRisk.impactedTasks.length} 个启用任务仍绑定停用模板。`
              : "当前没有启用任务依赖停用模板。"
          }
          examples={templateRisk.disabledTemplatesInUse.map((template) => template.name)}
          actionLabel="查看模板风险"
          onAction={onInspectTemplateRisk}
        />

        <RiskCard
          icon={recordRiskCount > 0 ? AlertTriangle : RefreshCcw}
          title="发送积压"
          count={recordRiskCount}
          accentClassName={
            recordRiskCount > 0
              ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }
          description={
            recordRiskCount > 0
              ? `失败 ${stats?.summary.failed_count ?? 0} 条，重试中 ${stats?.summary.retrying_count ?? 0} 条。`
              : "失败与重试队列目前都已清空。"
          }
          examples={
            [
              stats?.summary.pending_count ? `待处理 ${stats.summary.pending_count} 条` : null,
              stats?.summary.avg_duration_ms ? `平均耗时 ${Math.round(stats.summary.avg_duration_ms)}ms` : null,
            ].filter(Boolean) as string[]
          }
          actionLabel="查看记录风险"
          onAction={onInspectRecordRisk}
          quickActions={[
            { label: `可重试 ${stats?.summary.failed_count ?? 0}`, onAction: () => onInspectRecordRisk("retryable") },
            { label: "错误码排查", onAction: () => onInspectRecordRisk("error-code") },
            { label: "重试耗尽", onAction: () => onInspectRecordRisk("retry-exhausted") },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function RiskCard({
  actionLabel,
  accentClassName,
  count,
  description,
  examples,
  icon: Icon,
  onAction,
  quickActions = [],
  title,
}: {
  actionLabel: string;
  accentClassName: string;
  count: number;
  description: string;
  examples: string[];
  icon: ElementType;
  onAction: () => void;
  quickActions?: Array<{ label: string; onAction: () => void }>;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className={accentClassName}>
          <Icon className="mr-1 h-3 w-3" />
          {count}
        </Badge>
      </div>

      <div className="mt-4 min-h-14 space-y-2">
        {examples.length ? (
          <div className="flex flex-wrap gap-1.5">
            {examples.slice(0, 3).map((example) => (
              <Badge key={example} variant="outline" className="border-border bg-background/60 text-muted-foreground">
                {example}
              </Badge>
            ))}
            {examples.length > 3 && (
              <Badge variant="outline" className="border-border bg-background/60 text-muted-foreground">
                +{examples.length - 3}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BellRing className="h-3.5 w-3.5" />
            当前没有额外风险样本需要处理。
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="mt-4 w-full justify-between" onClick={onAction}>
        {actionLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
      {quickActions.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {quickActions.map((item) => (
            <Button key={item.label} variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={item.onAction}>
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
