"use client";

import { Insight } from "@/types/entities";
import { companyLabels, insightTypeLabels, impactLevelLabels, confidenceLevelLabels } from "@/types/labels";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";

interface InsightDetailSheetProps {
  insight: Insight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InsightDetailSheet({ insight, open, onOpenChange }: InsightDetailSheetProps) {
  if (!insight) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>研究结论详情</SheetTitle>
          <SheetDescription className="line-clamp-2">{insight.insight_content}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{companyLabels[insight.company] || insight.company}</Badge>
            <Badge variant="secondary">{insightTypeLabels[insight.insight_type] || insight.insight_type}</Badge>
            <Badge variant="outline">{impactLevelLabels[insight.impact_level] || insight.impact_level}</Badge>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">创建时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(insight.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">更新时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(insight.updated_at)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">结论内容</p>
            <p className="text-sm text-muted-foreground">{insight.insight_content}</p>
          </div>

          {insight.reasoning_brief && (
            <div>
              <p className="text-sm font-medium mb-2">推理依据</p>
              <p className="text-sm text-muted-foreground">{insight.reasoning_brief}</p>
            </div>
          )}

          {insight.action_suggestion && (
            <div>
              <p className="text-sm font-medium mb-2">行动建议</p>
              <p className="text-sm text-muted-foreground">{insight.action_suggestion}</p>
            </div>
          )}

          <Separator />

          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">置信度</span>
              <Badge variant="outline">{confidenceLevelLabels[insight.confidence] || insight.confidence}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">关联事实ID</span>
              <span className="text-sm font-medium">{insight.fact_id}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}