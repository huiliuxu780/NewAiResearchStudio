"use client";

import { AlertTriangle, BellRing, RadioTower, RefreshCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PushWorkbenchTab = "channels" | "tasks" | "records" | "templates";
type PushWorkbenchFocusMode = "none" | "task-risk" | "channel-risk" | "template-risk" | "record-risk";

export function PushWorkbenchShortcuts({
  activeTab,
  focusMode,
  selectedTemplateName,
  selectedRetryableCount,
  selectedRetryableTaskName,
  onCreateChannel,
  onCreateTask,
  onCreateTemplate,
  onEnterTaskRisk,
  onEnterChannelRisk,
  onEnterTemplateRisk,
  onEnterRecordRisk,
  onBatchRetryRecords,
  onFocusSelectedTask,
  onPreviewSelectedTemplate,
}: {
  activeTab: PushWorkbenchTab;
  focusMode: PushWorkbenchFocusMode;
  selectedTemplateName?: string | null;
  selectedRetryableCount: number;
  selectedRetryableTaskName?: string | null;
  onCreateChannel: () => void;
  onCreateTask: () => void;
  onCreateTemplate: () => void;
  onEnterTaskRisk: () => void;
  onEnterChannelRisk: () => void;
  onEnterTemplateRisk: () => void;
  onEnterRecordRisk: () => void;
  onBatchRetryRecords: () => void;
  onFocusSelectedTask: () => void;
  onPreviewSelectedTemplate: () => void;
}) {
  const title =
    activeTab === "channels"
      ? "渠道动作"
      : activeTab === "tasks"
        ? "任务动作"
        : activeTab === "records"
          ? "记录动作"
          : "模板动作";

  const description =
    activeTab === "channels"
      ? focusMode === "channel-risk"
        ? "当前在处理停用渠道依赖，可直接回到风险处理。"
        : "优先补渠道配置，或切进依赖风险视图。"
      : activeTab === "tasks"
        ? focusMode === "task-risk"
          ? "当前在处理风险任务，可直接进入任务处置。"
          : "先建任务，或直接收敛到风险任务。"
        : activeTab === "records"
          ? selectedRetryableCount > 0
            ? "当前已经选中失败记录，可以直接批量处置。"
            : "先进入发送积压视图，再处理失败与重试问题。"
          : selectedTemplateName
            ? `当前已选模板「${selectedTemplateName}」，可以直接回到预览。`
            : "先创建模板，或切入模板依赖风险视图。";

  const actions =
    activeTab === "channels"
      ? [
          { label: "新建渠道", icon: RadioTower, onClick: onCreateChannel, variant: "default" as const },
          { label: "查看渠道风险", icon: AlertTriangle, onClick: onEnterChannelRisk, variant: "outline" as const },
        ]
      : activeTab === "tasks"
        ? [
            { label: "新建任务", icon: BellRing, onClick: onCreateTask, variant: "default" as const },
            { label: "风险任务", icon: AlertTriangle, onClick: onEnterTaskRisk, variant: "outline" as const },
          ]
        : activeTab === "records"
          ? [
              { label: "发送积压", icon: AlertTriangle, onClick: onEnterRecordRisk, variant: "outline" as const },
              {
                label: `批量重试${selectedRetryableCount ? ` (${selectedRetryableCount})` : ""}`,
                icon: RefreshCcw,
                onClick: onBatchRetryRecords,
                variant: "default" as const,
                disabled: selectedRetryableCount === 0,
              },
              {
                label: selectedRetryableTaskName ? `聚焦任务：${selectedRetryableTaskName}` : "聚焦所选任务",
                icon: BellRing,
                onClick: onFocusSelectedTask,
                variant: "outline" as const,
                disabled: !selectedRetryableTaskName,
              },
            ]
          : [
              { label: "新建模板", icon: Sparkles, onClick: onCreateTemplate, variant: "default" as const },
              {
                label: selectedTemplateName ? `预览：${selectedTemplateName}` : "查看模板预览",
                icon: Sparkles,
                onClick: onPreviewSelectedTemplate,
                variant: "outline" as const,
                disabled: !selectedTemplateName,
              },
              { label: "模板风险", icon: AlertTriangle, onClick: onEnterTemplateRisk, variant: "outline" as const },
            ];

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {focusMode !== "none" ? (
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                专注中
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.label} size="sm" variant={action.variant} onClick={action.onClick} disabled={action.disabled}>
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
