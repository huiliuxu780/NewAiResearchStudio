"use client";

import { useMemo } from "react";
import { Eye, Loader2, RefreshCcw, Send } from "lucide-react";
import { PushSectionEmpty, PushStatusBadge, formatDateTime, formatDuration, getChannelTypeLabel, getContentFormatLabel } from "@/components/push/push-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushChannel, PushRecord, PushTask } from "@/types/push";

export function PushRecordsTab({
  recordStatusFilter,
  recordChannelFilter,
  recordChannelIdFilter,
  taskOptions,
  channelOptions,
  selectedTaskId,
  focusedTaskName,
  data,
  error,
  focusMode = "all",
  isLoading,
  onClearFocusMode,
  retryingRecordId,
  onRecordStatusChange,
  onRecordChannelChange,
  onRecordChannelIdChange,
  onRecordTaskChange,
  onClearTaskFilter,
  onRecordPageChange,
  onRecordPageSizeChange,
  onViewRecord,
  onRetryRecord,
}: {
  recordStatusFilter: string;
  recordChannelFilter: string;
  recordChannelIdFilter: string;
  taskOptions: PushTask[];
  channelOptions: PushChannel[];
  selectedTaskId?: string | null;
  focusedTaskName?: string | null;
  data?: PaginatedResponse<PushRecord>;
  error?: Error;
  focusMode?: "all" | "risk";
  isLoading: boolean;
  onClearFocusMode?: () => void;
  retryingRecordId: string | null;
  onRecordStatusChange: (value: string) => void;
  onRecordChannelChange: (value: string) => void;
  onRecordChannelIdChange: (value: string) => void;
  onRecordTaskChange: (value: string) => void;
  onClearTaskFilter: () => void;
  onRecordPageChange: (page: number) => void;
  onRecordPageSizeChange: (size: number) => void;
  onViewRecord: (record: PushRecord) => void;
  onRetryRecord: (record: PushRecord) => void;
}) {
  const taskNameById = useMemo(
    () =>
      taskOptions.reduce<Record<string, string>>((acc, task) => {
        acc[task.id] = task.name;
        return acc;
      }, {}),
    [taskOptions]
  );

  const channelNameById = useMemo(
    () =>
      channelOptions.reduce<Record<string, string>>((acc, channel) => {
        acc[channel.id] = channel.name;
        return acc;
      }, {}),
    [channelOptions]
  );

  const displayItems = useMemo(
    () =>
      focusMode === "risk"
        ? (data?.items ?? []).filter((record) => record.status === "failed" || record.status === "retrying" || record.status === "pending")
        : (data?.items ?? []),
    [data?.items, focusMode]
  );

  const summary = useMemo(() => {
    const counts = { total: 0, success: 0, failed: 0, retrying: 0, pending: 0 };

    displayItems.forEach((record) => {
      counts.total += 1;
      if (record.status === "success") counts.success += 1;
      if (record.status === "failed") counts.failed += 1;
      if (record.status === "retrying") counts.retrying += 1;
      if (record.status === "pending") counts.pending += 1;
    });

    return counts;
  }, [displayItems]);

  return (
    <Card className="border-border/40 bg-background/50 py-0">
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle className="text-base">执行记录</CardTitle>
          <CardDescription>
            {focusedTaskName ? `当前聚焦任务「${focusedTaskName}」的执行结果，可快速核对本次调试发送。` : "追踪执行结果、失败原因和重试状态。"}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {focusedTaskName && (
            <Button size="sm" variant="outline" onClick={onClearTaskFilter}>
              清除任务聚焦
            </Button>
          )}
          <Select value={recordStatusFilter} onValueChange={(value) => onRecordStatusChange(value ?? "all")}>
            <SelectTrigger className="w-[120px] bg-background/70">
              <SelectValue placeholder="记录状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="retrying">重试中</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recordChannelFilter} onValueChange={(value) => onRecordChannelChange(value ?? "all")}>
            <SelectTrigger className="w-[140px] bg-background/70">
              <SelectValue placeholder="渠道类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部渠道</SelectItem>
              <SelectItem value="feishu">飞书</SelectItem>
              <SelectItem value="email">邮件</SelectItem>
              <SelectItem value="dingtalk">钉钉</SelectItem>
              <SelectItem value="wechat_work">企业微信</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recordChannelIdFilter} onValueChange={(value) => onRecordChannelIdChange(value ?? "all")}>
            <SelectTrigger className="w-[180px] bg-background/70">
              <SelectValue placeholder="具体渠道" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部配置</SelectItem>
              {channelOptions.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTaskId ?? "all"} onValueChange={(value) => onRecordTaskChange(value ?? "all")}>
            <SelectTrigger className="w-[180px] bg-background/70">
              <SelectValue placeholder="关联任务" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部任务</SelectItem>
              {taskOptions.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {focusMode === "risk" && (
        <CardContent className="flex flex-col gap-3 border-b border-border/50 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">专注视图：发送积压</p>
            <p className="text-xs text-muted-foreground">仅显示失败、重试中和待处理的记录，优先处理真正阻塞发送的积压。</p>
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
          正在加载推送记录...
        </CardContent>
      ) : data?.items.length ? (
        <>
          <CardContent className="grid gap-3 border-b border-border/50 py-4 md:grid-cols-4">
            <RecordSummaryCard label="当前页记录" value={summary.total} tone="slate" />
            <RecordSummaryCard label="成功" value={summary.success} tone="emerald" />
            <RecordSummaryCard label="失败" value={summary.failed} tone="rose" />
            <RecordSummaryCard label="重试与待处理" value={summary.retrying + summary.pending} tone="amber" />
          </CardContent>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>推送标题</TableHead>
                <TableHead>渠道</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>重试</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>完成时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="max-w-[280px] whitespace-normal">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{record.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{taskNameById[record.task_id] ?? `任务 ${record.task_id.slice(0, 8)}`}</span>
                        <span>·</span>
                        <span>{getContentFormatLabel(record.content_format)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{channelNameById[record.channel_id] ?? "未命名渠道"}</p>
                      <p className="text-xs text-muted-foreground">{getChannelTypeLabel(record.channel_type)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[260px] whitespace-normal">
                    <div className="space-y-1">
                      <PushStatusBadge status={record.status} />
                      {record.error_message ? (
                        <p className="line-clamp-2 text-xs text-destructive">{record.error_message}</p>
                      ) : record.status === "success" ? (
                        <p className="text-xs text-emerald-500">本次投递已成功完成。</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">最近一次执行暂未返回错误详情。</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.retry_count} / {record.max_retries}</TableCell>
                  <TableCell>{formatDuration(record.duration_ms)}</TableCell>
                  <TableCell>{formatDateTime(record.completed_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onViewRecord(record)}>
                        <Eye className="h-3.5 w-3.5" />
                        查看
                      </Button>
                      <Button size="sm" variant="secondary" disabled={retryingRecordId === record.id || record.status === "success"} onClick={() => onRetryRecord(record)}>
                        {retryingRecordId === record.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                        重试
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
            onPageChange={onRecordPageChange}
            onPageSizeChange={onRecordPageSizeChange}
          />
        </>
      ) : (
        <CardContent className="pt-4">
          <PushSectionEmpty
            icon={Send}
            title={focusMode === "risk" ? "当前结果里没有发送积压" : "暂无执行记录"}
            description={focusMode === "risk" ? "可以退出专注视图，或扩大筛选范围后再看一轮。" : "切换筛选条件，或者先从任务 tab 手动触发一轮推送。"}
          />
        </CardContent>
      )}
    </Card>
  );
}

function RecordSummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "emerald" | "rose" | "amber";
}) {
  const badgeClassName =
    tone === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : tone === "rose"
        ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
        : tone === "amber"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
          : "border-border bg-muted/30 text-muted-foreground";

  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Badge variant="outline" className={badgeClassName}>
          {value}
        </Badge>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
