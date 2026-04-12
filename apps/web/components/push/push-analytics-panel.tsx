"use client";

import { AlertTriangle, BarChart3, BellRing, RadioTower, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PushSectionEmpty, formatDateTime, formatPercent } from "@/components/push/push-shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PushStats } from "@/types/push";

export function PushAnalyticsPanel({
  stats,
  isLoading,
}: {
  stats?: PushStats;
  isLoading?: boolean;
}) {
  if (isLoading && !stats) {
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="border-border/40 bg-background/60">
          <CardContent className="py-16">
            <div className="h-56 animate-pulse rounded-xl bg-muted/50" />
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card className="border-border/40 bg-background/60">
            <CardContent className="py-16">
              <div className="h-32 animate-pulse rounded-xl bg-muted/50" />
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-background/60">
            <CardContent className="py-16">
              <div className="h-32 animate-pulse rounded-xl bg-muted/50" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <PushSectionEmpty
        icon={BarChart3}
        title="暂无推送分析数据"
        description="统计接口返回后，这里会展示趋势、渠道表现和失败分布。"
      />
    );
  }

  const topChannels = [...stats.by_channel].sort((a, b) => b.total_count - a.total_count).slice(0, 5);
  const topTasks = [...stats.by_task].sort((a, b) => b.total_count - a.total_count).slice(0, 5);
  const topErrors = [...stats.error_distribution].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <Card className="border-border/40 bg-background/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            30 天推送趋势
          </CardTitle>
          <CardDescription>同时观察成功量和失败量的变化，快速识别异常波动。</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.trend.length ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.45} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success_count"
                    name="成功"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed_count"
                    name="失败"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <PushSectionEmpty icon={TrendingUp} title="暂无趋势数据" description="还没有可用于绘制趋势图的推送统计。" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-border/40 bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RadioTower className="h-4 w-4 text-sky-400" />
              渠道表现
            </CardTitle>
            <CardDescription>按总量排序的渠道成功率对比。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topChannels.length ? topChannels.map((channel) => (
              <div key={channel.channel_type} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{channel.channel_name}</span>
                  <span className="text-muted-foreground">{formatPercent(channel.success_rate)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-sky-500 to-emerald-500"
                    style={{ width: `${Math.max(6, Math.min(channel.success_rate, 100))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>总计 {channel.total_count}</span>
                  <span>失败 {channel.failed_count}</span>
                </div>
              </div>
            )) : (
              <PushSectionEmpty icon={RadioTower} title="暂无渠道表现" description="推送渠道产生数据后会显示成功率排行。" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              失败分布
            </CardTitle>
            <CardDescription>优先关注出现频率最高的错误类型。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topErrors.length ? topErrors.map((item, index) => (
              <div key={`${item.error_code ?? "unknown"}-${index}`} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{item.error_code || "未归类错误"}</p>
                  <p className="text-xs text-muted-foreground">{item.count} 次</p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.error_message || "暂无错误描述"}
                </p>
                <p className="mt-2 text-xs text-amber-400">{item.percentage.toFixed(1)}% 的失败记录</p>
              </div>
            )) : (
              <PushSectionEmpty icon={AlertTriangle} title="暂无失败分布" description="当出现失败记录后，这里会自动汇总主要错误。" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-background/60 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellRing className="h-4 w-4 text-violet-400" />
            热点任务
          </CardTitle>
          <CardDescription>按推送量排序的任务执行概览，方便判断哪些任务值得重点关注。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topTasks.length ? topTasks.map((task) => (
            <div key={task.task_id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="truncate text-sm font-medium text-foreground">{task.task_name}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">总量</p>
                  <p className="mt-1 font-semibold text-foreground">{task.total_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">成功率</p>
                  <p className="mt-1 font-semibold text-foreground">{formatPercent(task.success_rate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">失败</p>
                  <p className="mt-1 font-semibold text-foreground">{task.failed_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">最近执行</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(task.last_executed_at)}</p>
                </div>
              </div>
            </div>
          )) : (
            <PushSectionEmpty icon={BellRing} title="暂无任务排行" description="任务产生推送数据后，这里会显示执行最频繁的任务。" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
