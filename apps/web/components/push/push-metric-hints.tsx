"use client";

import type { ElementType } from "react";
import { AlertTriangle, RefreshCcw, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/components/push/push-shared";
import type { PushStats } from "@/types/push";

export function PushMetricHints({ stats }: { stats?: PushStats }) {
  return (
    <Card className="border-border/40 bg-background/60">
      <CardHeader>
        <CardTitle className="text-base">风险与提醒</CardTitle>
        <CardDescription>这里保留本页最值得盯住的推送信号，减少漏看失败任务。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricHint
          icon={AlertTriangle}
          iconClassName="text-amber-400"
          title="失败记录"
          value={String(stats?.summary.failed_count ?? 0)}
          description="失败数持续抬升时，优先进入记录 tab 查看错误详情和重试动作。"
        />
        <MetricHint
          icon={RefreshCcw}
          iconClassName="text-sky-400"
          title="重试中的记录"
          value={String(stats?.summary.retrying_count ?? 0)}
          description="如果重试长时间不下降，通常说明渠道配置或模板变量存在系统性问题。"
        />
        <MetricHint
          icon={Send}
          iconClassName="text-emerald-400"
          title="平均耗时"
          value={formatDuration(stats?.summary.avg_duration_ms ?? null)}
          description="这是最近 30 天的平均执行时间，可用于观察渠道性能是否退化。"
        />
      </CardContent>
    </Card>
  );
}

function MetricHint({
  icon: Icon,
  iconClassName,
  title,
  value,
  description,
}: {
  icon: ElementType;
  iconClassName: string;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className={`h-4 w-4 ${iconClassName}`} />
        {title}
      </div>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
