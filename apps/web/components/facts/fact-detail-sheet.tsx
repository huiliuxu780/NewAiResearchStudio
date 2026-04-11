"use client";

import { Fact } from "@/types/entities";
import { companyLabels, eventTypeLabels, reviewStatusLabels, importanceLevelLabels, confidenceLevelLabels } from "@/types/labels";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Calendar, Globe } from "lucide-react";

interface FactDetailSheetProps {
  fact: Fact | null;
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

export function FactDetailSheet({ fact, open, onOpenChange }: FactDetailSheetProps) {
  if (!fact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>事实详情</SheetTitle>
          <SheetDescription className="line-clamp-2">{fact.fact_summary}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{companyLabels[fact.company] || fact.company}</Badge>
            <Badge variant="secondary">{eventTypeLabels[fact.event_type] || fact.event_type}</Badge>
            <Badge variant={fact.review_status === "confirmed" ? "default" : "secondary"}>
              {reviewStatusLabels[fact.review_status] || fact.review_status}
            </Badge>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">来源地址</p>
                <a
                  href={fact.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {fact.source_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">发布时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(fact.published_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">创建时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(fact.created_at)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">主题一级</span>
              <span className="text-sm font-medium">{fact.topic_level_1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">主题二级</span>
              <span className="text-sm font-medium">{fact.topic_level_2 || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">实体类型</span>
              <span className="text-sm font-medium">{fact.entity_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">实体名称</span>
              <span className="text-sm font-medium">{fact.entity_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">重要性</span>
              <Badge variant="outline">{importanceLevelLabels[fact.importance_level] || fact.importance_level}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">置信度</span>
              <Badge variant="outline">{confidenceLevelLabels[fact.confidence] || fact.confidence}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">能力等级</span>
              <span className="text-sm font-medium">{fact.capability_level || "-"}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}