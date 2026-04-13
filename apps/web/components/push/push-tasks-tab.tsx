"use client";

import { type ElementType, useMemo } from "react";
import { AlertTriangle, BellRing, Eye, Loader2, Play, Plus, Send, TrendingUp } from "lucide-react";
import { matchesTaskRiskFilter, summarizeTaskRisk, type PushTaskRiskFilter } from "@/lib/push-console-utils";
import { PushSectionEmpty, PushStatusBadge, formatDateTime, formatPercent, getTriggerTypeLabel } from "@/components/push/push-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushChannel, PushTask, PushTemplate } from "@/types/push";

export function PushTasksTab({
  taskTriggerFilter,
  taskStatusFilter,
  taskEnabledFilter,
  taskRiskFilter,
  channelOptions,
  data,
  error,
  focusMode = "all",
  isLoading,
  onEnterFocusMode,
  onClearFocusMode,
  templateOptions,
  updatingTaskId,
  triggeringTaskId,
  onTaskTriggerChange,
  onTaskStatusChange,
  onTaskEnabledChange,
  onTaskRiskChange,
  onTaskPageChange,
  onTaskPageSizeChange,
  onCreateTask,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onInspectTaskRecords,
  onViewTask,
  onToggleTask,
  onTriggerTask,
}: {
  taskTriggerFilter: string;
  taskStatusFilter: string;
  taskEnabledFilter: string;
  taskRiskFilter: PushTaskRiskFilter;
  channelOptions: PushChannel[];
  data?: PaginatedResponse<PushTask>;
  error?: Error;
  focusMode?: "all" | "risk";
  isLoading: boolean;
  onEnterFocusMode?: () => void;
  onClearFocusMode?: () => void;
  templateOptions: PushTemplate[];
  updatingTaskId: string | null;
  triggeringTaskId: string | null;
  onTaskTriggerChange: (value: string) => void;
  onTaskStatusChange: (value: string) => void;
  onTaskEnabledChange: (value: string) => void;
  onTaskRiskChange: (value: PushTaskRiskFilter) => void;
  onTaskPageChange: (page: number) => void;
  onTaskPageSizeChange: (size: number) => void;
  onCreateTask: () => void;
  onEditTask: (task: PushTask) => void;
  onDuplicateTask: (task: PushTask) => void;
  onDeleteTask: (task: PushTask) => void;
  onInspectTaskRecords: (task: PushTask) => void;
  onViewTask: (task: PushTask) => void;
  onToggleTask: (task: PushTask) => void;
  onTriggerTask: (task: PushTask) => void;
}) {
  const summary = useMemo(() => {
    const initial = {
      totalTasks: data?.items.length ?? 0,
      enabledTasks: 0,
      totalExecutions: 0,
      successCount: 0,
      failureCount: 0,
    };

    return (data?.items ?? []).reduce((acc, task) => {
      if (task.is_enabled) acc.enabledTasks += 1;
      acc.totalExecutions += task.total_executions;
      acc.successCount += task.success_count;
      acc.failureCount += task.failure_count;
      return acc;
    }, initial);
  }, [data?.items]);

  const successRate =
    summary.successCount + summary.failureCount > 0
      ? (summary.successCount / (summary.successCount + summary.failureCount)) * 100
      : 0;

  const channelById = useMemo(
    () =>
      channelOptions.reduce<Record<string, PushChannel>>((acc, channel) => {
        acc[channel.id] = channel;
        return acc;
      }, {}),
    [channelOptions]
  );

  const templateById = useMemo(
    () =>
      templateOptions.reduce<Record<string, PushTemplate>>((acc, template) => {
        acc[template.id] = template;
        return acc;
      }, {}),
    [templateOptions]
  );

  const riskSummaryByTaskId = useMemo(
    () =>
      (data?.items ?? []).reduce<Record<string, ReturnType<typeof summarizeTaskRisk>>>((acc, task) => {
        acc[task.id] = summarizeTaskRisk(task, channelById, templateById);
        return acc;
      }, {}),
    [channelById, data?.items, templateById]
  );

  const riskTaskIds = useMemo(() => {
    return new Set(
      (data?.items ?? [])
        .filter((task) => riskSummaryByTaskId[task.id]?.hasRisk)
        .map((task) => task.id)
    );
  }, [data?.items, riskSummaryByTaskId]);

  const riskTaskCount = riskTaskIds.size;
  const failureRiskCount = useMemo(
    () => (data?.items ?? []).filter((task) => (riskSummaryByTaskId[task.id]?.failureCount ?? 0) > 0).length,
    [data?.items, riskSummaryByTaskId]
  );
  const dependencyRiskCount = useMemo(
    () =>
      (data?.items ?? []).filter((task) => {
        const summary = riskSummaryByTaskId[task.id];
        return Boolean(summary?.disabledTemplate || (summary?.disabledChannelCount ?? 0) > 0);
      }).length,
    [data?.items, riskSummaryByTaskId]
  );

  const displayItems = useMemo(
    () =>
      (focusMode === "risk" ? (data?.items ?? []).filter((task) => riskTaskIds.has(task.id)) : (data?.items ?? [])).filter((task) =>
        matchesTaskRiskFilter(riskSummaryByTaskId[task.id] ?? { hasRisk: false, failureCount: 0, disabledChannelCount: 0, disabledTemplate: false, reasons: [] }, taskRiskFilter)
      ),
    [data?.items, focusMode, riskSummaryByTaskId, riskTaskIds, taskRiskFilter]
  );

  return (
    <Card className="border-border/40 bg-background/50 py-0">
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle className="text-base">推送任务</CardTitle>
          <CardDescription>查看调度状态、快速启停，并支持手动触发验证链路。</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {focusMode !== "risk" && riskTaskCount > 0 ? (
            <Button size="sm" variant="outline" onClick={onEnterFocusMode}>
              <AlertTriangle className="h-3.5 w-3.5" />
              风险任务 {riskTaskCount}
            </Button>
          ) : null}
          <Select value={taskTriggerFilter} onValueChange={(value) => onTaskTriggerChange(value ?? "all")}>
            <SelectTrigger className="w-[130px] bg-background/70">
              <SelectValue placeholder="触发方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部触发</SelectItem>
              <SelectItem value="scheduled">定时触发</SelectItem>
              <SelectItem value="event_triggered">事件触发</SelectItem>
              <SelectItem value="manual">手动触发</SelectItem>
            </SelectContent>
          </Select>

          <Select value={taskStatusFilter} onValueChange={(value) => onTaskStatusChange(value ?? "all")}>
            <SelectTrigger className="w-[120px] bg-background/70">
              <SelectValue placeholder="运行状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="enabled">已启用</SelectItem>
              <SelectItem value="disabled">已停用</SelectItem>
              <SelectItem value="running">执行中</SelectItem>
            </SelectContent>
          </Select>

          <Select value={taskEnabledFilter} onValueChange={(value) => onTaskEnabledChange(value ?? "all")}>
            <SelectTrigger className="w-[120px] bg-background/70">
              <SelectValue placeholder="启停状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部启停</SelectItem>
              <SelectItem value="true">已启用</SelectItem>
              <SelectItem value="false">已停用</SelectItem>
            </SelectContent>
          </Select>

          <Select value={taskRiskFilter} onValueChange={(value) => onTaskRiskChange((value as PushTaskRiskFilter) ?? "all")}>
            <SelectTrigger className="w-[150px] bg-background/70">
              <SelectValue placeholder="风险类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部任务</SelectItem>
              <SelectItem value="risk">全部风险 ({riskTaskCount})</SelectItem>
              <SelectItem value="failing">失败风险 ({failureRiskCount})</SelectItem>
              <SelectItem value="dependency">依赖风险 ({dependencyRiskCount})</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={onCreateTask}>
            <Plus className="h-3.5 w-3.5" />
            新建任务
          </Button>
        </div>
      </CardHeader>

      {focusMode === "risk" && (
        <CardContent className="flex flex-col gap-3 border-b border-border/50 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">专注视图：风险任务</p>
            <p className="text-xs text-muted-foreground">仅显示当前已加载结果里需要优先介入的任务。</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClearFocusMode}>
            退出专注视图
          </Button>
        </CardContent>
      )}

      {error ? (
        <CardContent className="py-8 text-sm text-destructive">{error.message}</CardContent>
      ) : isLoading ? (
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载任务列表...
        </CardContent>
      ) : data?.items.length ? (
        <>
          <CardContent className="grid gap-3 border-b border-border/50 py-4 md:grid-cols-4">
            <TaskSummaryCard label="当前页任务" value={summary.totalTasks} tone="slate" icon={BellRing} />
            <TaskSummaryCard label="已启用" value={summary.enabledTasks} tone="emerald" icon={TrendingUp} />
            <TaskSummaryCard label="累计执行" value={summary.totalExecutions} tone="sky" icon={Play} />
            <TaskSummaryCard label="综合成功率" value={formatPercent(successRate)} tone="amber" icon={AlertTriangle} />
          </CardContent>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务名称</TableHead>
                <TableHead>触发方式</TableHead>
                <TableHead>编排资源</TableHead>
                <TableHead>执行概览</TableHead>
                <TableHead>健康度</TableHead>
                <TableHead>最近执行</TableHead>
                <TableHead>下次执行</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-[260px] whitespace-normal">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{task.name}</p>
                      <p className="text-xs text-muted-foreground">{task.description || "暂无描述"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTriggerTypeLabel(task.trigger_type)}</TableCell>
                  <TableCell className="min-w-[260px] max-w-[320px] whitespace-normal">
                    <TaskResourceCell task={task} channelById={channelById} templateById={templateById} />
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{task.total_executions} 次</p>
                      <p className="text-xs text-muted-foreground">
                        成功 {task.success_count} / 失败 {task.failure_count}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PushStatusBadge status={task.status} />
                        <Badge
                          variant="outline"
                          className={
                            task.failure_count > 0
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          }
                        >
                          {formatPercent(
                            task.success_count + task.failure_count > 0
                              ? (task.success_count / (task.success_count + task.failure_count)) * 100
                              : 0
                          )}
                        </Badge>
                      </div>
                      <TaskRiskSummary task={task} summary={riskSummaryByTaskId[task.id]} />
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(task.last_executed_at)}</TableCell>
                  <TableCell>{formatDateTime(task.next_scheduled_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onViewTask(task)}>
                        <Eye className="h-3.5 w-3.5" />
                        查看
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onEditTask(task)}>
                        编辑
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDuplicateTask(task)}>
                        复制
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onInspectTaskRecords(task)}>
                        <Send className="h-3.5 w-3.5" />
                        记录
                      </Button>
                      <Button size="sm" variant={task.is_enabled ? "outline" : "default"} disabled={updatingTaskId === task.id} onClick={() => onToggleTask(task)}>
                        {updatingTaskId === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                        {task.is_enabled ? "停用" : "启用"}
                      </Button>
                      <Button size="sm" variant="secondary" disabled={triggeringTaskId === task.id} onClick={() => onTriggerTask(task)}>
                        {triggeringTaskId === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        触发
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteTask(task)}>
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            totalPages={data.total_pages}
            onPageChange={onTaskPageChange}
            onPageSizeChange={onTaskPageSizeChange}
          />
        </>
      ) : (
        <CardContent className="pt-4">
          <PushSectionEmpty
            icon={BellRing}
            title={focusMode === "risk" ? "当前结果里没有风险任务" : "暂无任务数据"}
            description={focusMode === "risk" ? "可以退出专注视图，或扩大筛选范围后再看一轮。" : "当前筛选条件下没有推送任务，可切换条件后重试。"}
          />
        </CardContent>
      )}
    </Card>
  );
}

function TaskSummaryCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  tone: "slate" | "emerald" | "sky" | "amber";
  icon: ElementType;
}) {
  const badgeClassName =
    tone === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : tone === "sky"
        ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
        : tone === "amber"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
          : "border-border bg-muted/30 text-muted-foreground";

  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Badge variant="outline" className={badgeClassName}>
          <Icon className="mr-1 h-3 w-3" />
          {typeof value === "number" ? value.toLocaleString("zh-CN") : value}
        </Badge>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">
        {typeof value === "number" ? value.toLocaleString("zh-CN") : value}
      </p>
    </div>
  );
}

function TaskResourceCell({
  task,
  channelById,
  templateById,
}: {
  task: PushTask;
  channelById: Record<string, PushChannel>;
  templateById: Record<string, PushTemplate>;
}) {
  const linkedChannels = task.channel_ids.map((channelId) => channelById[channelId]).filter(Boolean);
  const disabledChannelCount = linkedChannels.filter((channel) => !channel.is_enabled).length;
  const template = task.template_id ? templateById[task.template_id] : null;

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">模板</p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{template?.name ?? "未绑定模板"}</p>
          {template && (
            <Badge
              variant="outline"
              className={
                template.is_enabled
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }
            >
              {template.is_enabled ? "可用" : "已停用"}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">渠道</p>
        {linkedChannels.length ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {linkedChannels.slice(0, 2).map((channel) => (
                <Badge
                  key={channel.id}
                  variant="outline"
                  className={
                    channel.is_enabled
                      ? "border-border bg-background/60 text-foreground"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }
                >
                  {channel.name}
                </Badge>
              ))}
              {linkedChannels.length > 2 && (
                <Badge variant="outline" className="border-border bg-background/60 text-muted-foreground">
                  +{linkedChannels.length - 2}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {disabledChannelCount > 0
                ? `包含 ${disabledChannelCount} 个停用渠道，建议检查发送链路。`
                : `共 ${linkedChannels.length} 个启用中的发送渠道。`}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">未绑定渠道</p>
        )}
      </div>
    </div>
  );
}

function TaskRiskSummary({
  task,
  summary,
}: {
  task: PushTask;
  summary?: {
    hasRisk: boolean;
    reasons: string[];
  };
}) {
  if (!summary?.hasRisk) {
    return <p className="text-xs text-muted-foreground">当前没有累计失败或依赖异常。</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {summary.reasons.map((reason) => (
          <Badge key={reason} variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {reason}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {task.failure_count > 0 ? "建议优先切到记录页查看失败明细。" : "建议优先修复依赖异常后再继续启用或触发。"}
      </p>
    </div>
  );
}
