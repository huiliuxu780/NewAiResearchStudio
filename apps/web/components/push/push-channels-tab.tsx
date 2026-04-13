"use client";

import { type ElementType, useMemo } from "react";
import { AlertTriangle, Copy, Eye, Loader2, Plus, RadioTower } from "lucide-react";
import { PushSectionEmpty, formatDateTime, getChannelTypeLabel } from "@/components/push/push-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushChannel, PushTask } from "@/types/push";

export function PushChannelsTab({
  channelTypeFilter,
  channelEnabledFilter,
  data,
  error,
  isLoading,
  taskOptions,
  togglingChannelId,
  onChannelTypeChange,
  onChannelEnabledChange,
  onChannelPageChange,
  onChannelPageSizeChange,
  onCreateChannel,
  onEditChannel,
  onDuplicateChannel,
  onDeleteChannel,
  onViewChannel,
  onToggleChannel,
}: {
  channelTypeFilter: string;
  channelEnabledFilter: string;
  data?: PaginatedResponse<PushChannel>;
  error?: Error;
  isLoading: boolean;
  taskOptions: PushTask[];
  togglingChannelId: string | null;
  onChannelTypeChange: (value: string) => void;
  onChannelEnabledChange: (value: string) => void;
  onChannelPageChange: (page: number) => void;
  onChannelPageSizeChange: (size: number) => void;
  onCreateChannel: () => void;
  onEditChannel: (channel: PushChannel) => void;
  onDuplicateChannel: (channel: PushChannel) => void;
  onDeleteChannel: (channel: PushChannel) => void;
  onViewChannel: (channel: PushChannel) => void;
  onToggleChannel: (channel: PushChannel) => void;
}) {
  const usageByChannelId = useMemo(
    () =>
      taskOptions.reduce<
        Record<string, { deliveryTotal: number; deliveryEnabled: number; alertTotal: number; alertEnabled: number }>
      >((acc, task) => {
        task.channel_ids.forEach((channelId) => {
          const current = acc[channelId] ?? { deliveryTotal: 0, deliveryEnabled: 0, alertTotal: 0, alertEnabled: 0 };
          current.deliveryTotal += 1;
          if (task.is_enabled) current.deliveryEnabled += 1;
          acc[channelId] = current;
        });

        if (task.alert_channel_id) {
          const current = acc[task.alert_channel_id] ?? { deliveryTotal: 0, deliveryEnabled: 0, alertTotal: 0, alertEnabled: 0 };
          current.alertTotal += 1;
          if (task.is_enabled && task.alert_on_failure) current.alertEnabled += 1;
          acc[task.alert_channel_id] = current;
        }

        return acc;
      }, {}),
    [taskOptions]
  );

  return (
    <Card className="border-border/40 bg-background/50 py-0">
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <CardTitle className="text-base">渠道配置</CardTitle>
          <CardDescription>统一查看渠道状态和配置，支持直接启停。</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={channelTypeFilter} onValueChange={(value) => onChannelTypeChange(value ?? "all")}>
            <SelectTrigger className="w-[140px] bg-background/70">
              <SelectValue placeholder="渠道类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="feishu">飞书</SelectItem>
              <SelectItem value="email">邮件</SelectItem>
              <SelectItem value="dingtalk">钉钉</SelectItem>
              <SelectItem value="wechat_work">企业微信</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelEnabledFilter} onValueChange={(value) => onChannelEnabledChange(value ?? "all")}>
            <SelectTrigger className="w-[120px] bg-background/70">
              <SelectValue placeholder="启用状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="true">已启用</SelectItem>
              <SelectItem value="false">已停用</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={onCreateChannel}>
            <Plus className="h-3.5 w-3.5" />
            新建渠道
          </Button>
        </div>
      </CardHeader>

      {error ? (
        <CardContent className="py-8 text-sm text-destructive">{error.message}</CardContent>
      ) : isLoading ? (
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载渠道列表...
        </CardContent>
      ) : data?.items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>渠道名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>引用情况</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="max-w-[240px] whitespace-normal">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.description || "暂无描述"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getChannelTypeLabel(channel.channel_type)}</TableCell>
                  <TableCell className="min-w-[240px] max-w-[300px] whitespace-normal">
                    <ChannelUsageCell channel={channel} usage={usageByChannelId[channel.id]} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={channel.is_enabled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-border bg-muted/30 text-muted-foreground"}
                    >
                      {channel.is_enabled ? "已启用" : "已停用"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(channel.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onViewChannel(channel)}>
                        <Eye className="h-3.5 w-3.5" />
                        查看
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onEditChannel(channel)}>
                        编辑
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDuplicateChannel(channel)}>
                        <Copy className="h-3.5 w-3.5" />
                        复制
                      </Button>
                      <Button
                        size="sm"
                        variant={channel.is_enabled ? "outline" : "default"}
                        disabled={togglingChannelId === channel.id}
                        onClick={() => onToggleChannel(channel)}
                      >
                        {togglingChannelId === channel.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RadioTower className="h-3.5 w-3.5" />}
                        {channel.is_enabled ? "停用" : "启用"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteChannel(channel)}>
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
            onPageChange={onChannelPageChange}
            onPageSizeChange={onChannelPageSizeChange}
          />
        </>
      ) : (
        <CardContent className="pt-4">
          <PushSectionEmpty icon={RadioTower} title="暂无可用渠道" description="试试切换筛选条件，或先在后端补充渠道配置。" />
        </CardContent>
      )}
    </Card>
  );
}

function ChannelUsageCell({
  channel,
  usage,
}: {
  channel: PushChannel;
  usage?: { deliveryTotal: number; deliveryEnabled: number; alertTotal: number; alertEnabled: number };
}) {
  const deliveryTotal = usage?.deliveryTotal ?? 0;
  const deliveryEnabled = usage?.deliveryEnabled ?? 0;
  const alertTotal = usage?.alertTotal ?? 0;
  const alertEnabled = usage?.alertEnabled ?? 0;
  const hasRisk = !channel.is_enabled && (deliveryEnabled > 0 || alertEnabled > 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <UsageBadge icon={RadioTower} label={`发送 ${deliveryTotal}`} tone={deliveryEnabled > 0 ? "sky" : "slate"} />
        <UsageBadge icon={AlertTriangle} label={`告警 ${alertTotal}`} tone={alertEnabled > 0 ? "amber" : "slate"} />
      </div>
      <p className="text-xs text-muted-foreground">
        {hasRisk
          ? `当前有 ${deliveryEnabled + alertEnabled} 个启用任务仍依赖这个已停用渠道。`
          : deliveryTotal || alertTotal
            ? `启用任务引用 ${deliveryEnabled} 个发送链路，${alertEnabled} 个失败告警链路。`
            : "当前没有任务引用这个渠道。"}
      </p>
    </div>
  );
}

function UsageBadge({
  icon: Icon,
  label,
  tone,
}: {
  icon: ElementType;
  label: string;
  tone: "slate" | "sky" | "amber";
}) {
  const className =
    tone === "sky"
      ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
      : tone === "amber"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
        : "border-border bg-background/60 text-muted-foreground";

  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
