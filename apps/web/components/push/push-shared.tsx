"use client";

import * as React from "react";
import { AlertTriangle, BellRing, CheckCircle2, Clock3, Copy, Loader2, RadioTower, RefreshCcw, Send, Settings2, Siren, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const channelTypeLabels: Record<string, string> = {
  feishu: "飞书",
  email: "邮件",
  dingtalk: "钉钉",
  wechat_work: "企业微信",
  slack: "Slack",
};

export const triggerTypeLabels: Record<string, string> = {
  scheduled: "定时触发",
  event_triggered: "事件触发",
  manual: "手动触发",
};

export const pushStatusLabels: Record<string, string> = {
  pending: "待处理",
  success: "成功",
  failed: "失败",
  retrying: "重试中",
  running: "执行中",
  enabled: "已启用",
  disabled: "已停用",
  active: "活跃",
};

export const contentFormatLabels: Record<string, string> = {
  text: "文本",
  html: "HTML",
  markdown: "Markdown",
  rich_text: "富文本",
};

export function getChannelTypeLabel(type: string) {
  return channelTypeLabels[type] ?? type;
}

export function getTriggerTypeLabel(type: string) {
  return triggerTypeLabels[type] ?? type;
}

export function getContentFormatLabel(format: string) {
  return contentFormatLabels[format] ?? format;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDuration(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  if (value < 1000) return `${value}ms`;
  return `${(value / 1000).toFixed(1)}s`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value).catch(() => {});
}

export function PushStatusBadge({ status }: { status: string }) {
  const config = getPushStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("gap-1 border", config.className)}>
      <Icon className={cn("h-3 w-3", status === "running" || status === "retrying" ? "animate-spin" : "")} />
      {config.label}
    </Badge>
  );
}

function getPushStatusConfig(status: string) {
  switch (status) {
    case "success":
      return { label: "成功", icon: CheckCircle2, variant: "outline" as const, className: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400" };
    case "failed":
      return { label: "失败", icon: AlertTriangle, variant: "outline" as const, className: "border-destructive/20 bg-destructive/10 text-destructive" };
    case "retrying":
      return { label: "重试中", icon: RefreshCcw, variant: "outline" as const, className: "border-amber-500/20 bg-amber-500/15 text-amber-400" };
    case "running":
      return { label: "执行中", icon: Loader2, variant: "outline" as const, className: "border-blue-500/20 bg-blue-500/15 text-blue-400" };
    case "pending":
      return { label: "待处理", icon: Clock3, variant: "outline" as const, className: "border-slate-500/20 bg-slate-500/15 text-slate-300" };
    default:
      return { label: pushStatusLabels[status] ?? status, icon: Settings2, variant: "outline" as const, className: "border-border bg-muted/30 text-muted-foreground" };
  }
}

export function PushSectionEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border py-16 text-center">
      <div className="mb-3 rounded-full bg-muted/30 p-3">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function PushDetailRow({
  icon: Icon,
  label,
  value,
  copyable = false,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-right">
        <span className="max-w-[240px] break-all text-sm font-medium text-foreground">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={() => copyToClipboard(value)}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            title="复制"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export const pushIcons = {
  channels: RadioTower,
  tasks: BellRing,
  records: Send,
  templates: FileText,
  alerts: Siren,
};
