"use client";

import { Insight } from "@/types";
import { insightTypeLabels, insightStatusLabels, priorityLabels, companyLabels, eventTypeLabels, factStatusLabels } from "@/types/labels";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface InsightDetailSheetProps {
  insight: Insight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewFact: (factId: string) => void;
}

export function InsightDetailSheet({
  insight,
  open,
  onOpenChange,
  onViewFact,
}: InsightDetailSheetProps) {
  if (!insight) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{insight.title}</SheetTitle>
          <SheetDescription>{insight.summary}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">结论详情</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">结论类型</span>
                <Badge variant="outline">{insightTypeLabels[insight.type]}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">重要性</span>
                <Badge variant="secondary">{priorityLabels[insight.priority]}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">状态</span>
                <Badge variant="secondary">{insightStatusLabels[insight.status]}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">作者</span>
                <span className="text-sm">{insight.author}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">创建时间</span>
                <span className="text-sm">{formatDate(insight.createdAt)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">更新时间</span>
                <span className="text-sm">{formatDate(insight.updatedAt)}</span>
              </div>
              {insight.reviewedBy && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">审核人</span>
                  <span className="text-sm">{insight.reviewedBy}</span>
                </div>
              )}
              {insight.publishedAt && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">发布时间</span>
                  <span className="text-sm">{formatDate(insight.publishedAt)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">标签</h3>
              <div className="flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <Badge key={tag} variant="ghost">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">关联事实</h3>
              <div className="space-y-2">
                {insight.relatedFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{fact.title}</span>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {fact.summary}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {companyLabels[fact.company]}
                          </Badge>
                          <Badge variant="ghost" className="text-xs">
                            {eventTypeLabels[fact.eventType]}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {factStatusLabels[fact.status]}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onViewFact(fact.id)}
                      >
                        <Eye className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}