"use client";

import { Eye, Loader2, RefreshCcw, Send } from "lucide-react";
import { PushSectionEmpty, PushStatusBadge, formatDateTime, formatDuration, getChannelTypeLabel, getContentFormatLabel } from "@/components/push/push-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushRecord } from "@/types/push";

export function PushRecordsTab({
  recordStatusFilter,
  recordChannelFilter,
  focusedTaskName,
  data,
  error,
  isLoading,
  retryingRecordId,
  onRecordStatusChange,
  onRecordChannelChange,
  onClearTaskFilter,
  onRecordPageChange,
  onRecordPageSizeChange,
  onViewRecord,
  onRetryRecord,
}: {
  recordStatusFilter: string;
  recordChannelFilter: string;
  focusedTaskName?: string | null;
  data?: PaginatedResponse<PushRecord>;
  error?: Error;
  isLoading: boolean;
  retryingRecordId: string | null;
  onRecordStatusChange: (value: string) => void;
  onRecordChannelChange: (value: string) => void;
  onClearTaskFilter: () => void;
  onRecordPageChange: (page: number) => void;
  onRecordPageSizeChange: (size: number) => void;
  onViewRecord: (record: PushRecord) => void;
  onRetryRecord: (record: PushRecord) => void;
}) {
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
        </div>
      </CardHeader>

      {error ? (
        <CardContent className="py-8 text-sm text-destructive">{error.message}</CardContent>
      ) : isLoading ? (
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载推送记录...
        </CardContent>
      ) : data?.items.length ? (
        <>
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
              {data.items.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="max-w-[280px] whitespace-normal">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{record.title}</p>
                      <p className="text-xs text-muted-foreground">{getContentFormatLabel(record.content_format)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getChannelTypeLabel(record.channel_type)}</TableCell>
                  <TableCell><PushStatusBadge status={record.status} /></TableCell>
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
          <PushSectionEmpty icon={Send} title="暂无执行记录" description="切换筛选条件，或者先从任务 tab 手动触发一轮推送。" />
        </CardContent>
      )}
    </Card>
  );
}
