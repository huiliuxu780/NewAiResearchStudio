"use client";

import { Globe, RadioTower, Settings2, ToggleLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PushChannel } from "@/types/push";
import { PushDetailRow, formatDateTime, formatJson, getChannelTypeLabel } from "@/components/push/push-shared";

export function PushChannelSheet({
  channel,
  open,
  onOpenChange,
}: {
  channel: PushChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!channel) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <RadioTower className="h-5 w-5" />
            渠道详情
          </SheetTitle>
          <SheetDescription>查看推送渠道配置与当前状态。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="mt-4 space-y-4">
            <PushDetailRow icon={RadioTower} label="渠道名称" value={channel.name} />
            <PushDetailRow icon={Globe} label="渠道类型" value={getChannelTypeLabel(channel.channel_type)} />
            <PushDetailRow icon={ToggleLeft} label="启用状态" value={channel.is_enabled ? "已启用" : "已停用"} />
            <PushDetailRow icon={Settings2} label="更新时间" value={formatDateTime(channel.updated_at)} />

            {channel.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">描述</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {channel.description}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">配置 JSON</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {formatJson(channel.config)}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
