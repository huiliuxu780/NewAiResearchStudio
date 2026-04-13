"use client";

import { AlertCircle, Clock3, Mail, RefreshCcw, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PushRecord } from "@/types/push";
import { PushDetailRow, PushStatusBadge, formatDateTime, formatDuration, formatJson, getChannelTypeLabel, getContentFormatLabel } from "@/components/push/push-shared";

export function PushRecordSheet({
  record,
  open,
  onOpenChange,
  onInspectTask,
  onInspectChannel,
  onRetryRecord,
  retrying,
}: {
  record: PushRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInspectTask?: (record: PushRecord) => void;
  onInspectChannel?: (record: PushRecord) => void;
  onRetryRecord?: (record: PushRecord) => void;
  retrying?: boolean;
}) {
  if (!record) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            推送记录详情
          </SheetTitle>
          <SheetDescription>查看推送执行结果、接收对象和错误信息。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm text-muted-foreground">推送标题</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{record.title}</p>
              </div>
              <PushStatusBadge status={record.status} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onInspectTask?.(record)}>
                <Search className="h-3.5 w-3.5" />
                查看任务记录
              </Button>
              <Button size="sm" variant="outline" onClick={() => onInspectChannel?.(record)}>
                <Mail className="h-3.5 w-3.5" />
                同渠道诊断
              </Button>
              {record.status === "failed" && (
                <Button size="sm" variant="secondary" disabled={retrying} onClick={() => onRetryRecord?.(record)}>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {retrying ? "重试中..." : "重试这条"}
                </Button>
              )}
            </div>

            <PushDetailRow icon={Mail} label="渠道类型" value={getChannelTypeLabel(record.channel_type)} />
            <PushDetailRow icon={Clock3} label="耗时" value={formatDuration(record.duration_ms)} />
            <PushDetailRow icon={Clock3} label="完成时间" value={formatDateTime(record.completed_at)} />
            <PushDetailRow icon={Clock3} label="重试次数" value={`${record.retry_count} / ${record.max_retries}`} />
            <PushDetailRow icon={Mail} label="内容格式" value={getContentFormatLabel(record.content_format)} />

            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">接收者</p>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                {record.recipients.length > 0 ? record.recipients.join("、") : "未指定"}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">推送内容</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {record.content}
              </pre>
            </div>

            {record.error_message && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  错误信息
                </p>
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {record.error_message}
                </div>
              </div>
            )}

            {record.response_data && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">渠道响应</p>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {formatJson(record.response_data)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
