"use client";

import { Fact } from "@/types";
import { companyLabels, eventTypeLabels, factStatusLabels } from "@/types/labels";
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

interface FactDetailSheetProps {
  fact: Fact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FactDetailSheet({
  fact,
  open,
  onOpenChange,
}: FactDetailSheetProps) {
  if (!fact) return null;

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
          <SheetTitle>{fact.title}</SheetTitle>
          <SheetDescription>{fact.summary}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">事实详情</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {fact.content}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">所属公司</span>
                <Badge variant="outline">{companyLabels[fact.company]}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">事件类型</span>
                <Badge variant="outline">{eventTypeLabels[fact.eventType]}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">复核状态</span>
                <Badge variant="secondary">{factStatusLabels[fact.status]}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">发布时间</span>
                <span className="text-sm">{formatDate(fact.createdAt)}</span>
              </div>
              {fact.reviewedBy && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">复核人</span>
                  <span className="text-sm">{fact.reviewedBy}</span>
                </div>
              )}
              {fact.reviewedAt && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">复核时间</span>
                  <span className="text-sm">{formatDate(fact.reviewedAt)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">标签</h3>
              <div className="flex flex-wrap gap-2">
                {fact.tags.map((tag) => (
                  <Badge key={tag} variant="ghost">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">原文对照</h3>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">来源标题:</span>
                    <span className="text-sm font-medium">{fact.rawRecord.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {fact.rawRecord.content}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>发布时间: {formatDate(fact.rawRecord.publishedAt)}</span>
                    <span>获取时间: {formatDate(fact.rawRecord.fetchedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}