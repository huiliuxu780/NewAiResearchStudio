"use client";

import { Source } from "@/types";
import { companyLabels, sourceTypeLabels } from "@/types/labels";
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

interface SourceDetailSheetProps {
  source: Source | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "暂无";
  return new Date(dateString).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SourceDetailSheet({ source, open, onOpenChange }: SourceDetailSheetProps) {
  if (!source) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{source.name}</SheetTitle>
          <SheetDescription>{source.description}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={source.isActive ? "default" : "secondary"}>
              {source.isActive ? "启用" : "停用"}
            </Badge>
            <Badge variant="outline">{companyLabels[source.company]}</Badge>
            <Badge variant="outline">{sourceTypeLabels[source.type]}</Badge>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">来源地址</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {source.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">最近采集时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(source.lastFetchedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">创建时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(source.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">更新时间</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(source.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">描述</p>
            <p className="text-sm text-muted-foreground">{source.description}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}