"use client";

import { RawRecord } from "@/types/entities";
import { companyLabels, crawlStatusLabels } from "@/types/labels";
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

interface RecordPreviewSheetProps {
  record: RawRecord | null;
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

export function RecordPreviewSheet({ record, open, onOpenChange }: RecordPreviewSheetProps) {
  if (!record) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{record.title}</SheetTitle>
          <SheetDescription>
            <Badge variant="outline">{companyLabels[record.company] || record.company}</Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={record.crawl_status === "success" ? "default" : "secondary"}>
              {crawlStatusLabels[record.crawl_status] || record.crawl_status}
            </Badge>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">来源地址</p>
                <a
                  href={record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {record.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">发布时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(record.published_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">采集时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(record.crawled_at)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {record.raw_content && (
            <div>
              <p className="text-sm font-medium mb-2">原始内容</p>
              <p className="text-sm text-muted-foreground line-clamp-6">{record.raw_content}</p>
            </div>
          )}

          {record.error_message && (
            <div>
              <p className="text-sm font-medium mb-2 text-destructive">错误信息</p>
              <p className="text-sm text-destructive">{record.error_message}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}