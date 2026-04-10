"use client";

import { RawRecord } from "@/types";
import { companyLabels, eventTypeLabels, rawRecordStatusLabels } from "@/types/labels";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Calendar, Globe, FileText, Sparkles } from "lucide-react";

interface RecordPreviewSheetProps {
  record: RawRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecordPreviewSheet({ record, open, onOpenChange }: RecordPreviewSheetProps) {
  if (!record) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>{record.title}</SheetTitle>
          <SheetDescription>
            来源：{record.source.name}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={record.status === "completed" ? "default" : "secondary"}>
              {rawRecordStatusLabels[record.status]}
            </Badge>
            <Badge variant="outline">{companyLabels[record.company]}</Badge>
            <Badge variant="outline">{eventTypeLabels[record.eventType]}</Badge>
            {record.tags.map((tag) => (
              <Badge key={tag} variant="ghost">{tag}</Badge>
            ))}
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">原文链接</p>
                <a
                  href={record.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {record.originalUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">发布时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(record.publishedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">采集时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(record.fetchedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">语言</p>
                <p className="text-sm text-muted-foreground">中文</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">原文内容</p>
            <ScrollArea className="h-[300px] rounded-md border border-border p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {record.content}
              </p>
            </ScrollArea>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4" />
              查看原文
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4" />
              查看快照
            </Button>
            <Button variant="default" className="flex-1">
              <Sparkles className="h-4 w-4" />
              生成事实
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}