"use client";

import { AlertTriangle, Braces, Copy, FileText, PencilLine, Sparkles, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PushTask, PushTemplate } from "@/types/push";
import { PushDetailRow, formatDateTime, formatJson, getContentFormatLabel } from "@/components/push/push-shared";

export function PushTemplateSheet({
  template,
  open,
  onOpenChange,
  dependentTasks,
  onEditTemplate,
  onDuplicateTemplate,
  onInspectDependencyTasks,
  onInspectTask,
  onPreviewTemplate,
  onInspectRisk,
}: {
  template: PushTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependentTasks?: PushTask[];
  onEditTemplate?: (template: PushTemplate) => void;
  onDuplicateTemplate?: (template: PushTemplate) => void;
  onInspectDependencyTasks?: (template: PushTemplate) => void;
  onInspectTask?: (task: PushTask) => void;
  onPreviewTemplate?: (template: PushTemplate) => void;
  onInspectRisk?: () => void;
}) {
  if (!template) return null;

  const linkedTasks = (dependentTasks ?? []).filter((task) => task.template_id === template.id);
  const enabledTaskCount = linkedTasks.filter((task) => task.is_enabled).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            模板详情
          </SheetTitle>
          <SheetDescription>查看模板结构、变量定义和默认值。</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onEditTemplate?.(template)}>
                <PencilLine className="h-3.5 w-3.5" />
                编辑模板
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDuplicateTemplate?.(template)}>
                <Copy className="h-3.5 w-3.5" />
                复制模板
              </Button>
              <Button size="sm" variant="outline" onClick={() => onPreviewTemplate?.(template)}>
                <Sparkles className="h-3.5 w-3.5" />
                查看模板预览
              </Button>
              <Button size="sm" variant="outline" onClick={() => onInspectDependencyTasks?.(template)}>
                依赖任务
              </Button>
              {!template.is_enabled && (
                <Button size="sm" variant="secondary" onClick={() => onInspectRisk?.()}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  查看依赖风险
                </Button>
              )}
            </div>

            <PushDetailRow icon={FileText} label="模板名称" value={template.name} />
            <PushDetailRow icon={ToggleLeft} label="启用状态" value={template.is_enabled ? "已启用" : "已停用"} />
            <PushDetailRow icon={ToggleLeft} label="系统模板" value={template.is_system ? "是" : "否"} />
            <PushDetailRow icon={FileText} label="内容格式" value={getContentFormatLabel(template.content_format)} />
            <PushDetailRow icon={FileText} label="适用渠道" value={template.channel_types.join("、")} />
            <PushDetailRow icon={FileText} label="更新时间" value={formatDateTime(template.updated_at)} />

            {linkedTasks.length ? (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">依赖任务</p>
                    <Badge variant="outline" className="border-sky-500/20 bg-sky-500/10 text-sky-400">
                      共 {linkedTasks.length} 个
                    </Badge>
                    {enabledTaskCount ? (
                      <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        启用中 {enabledTaskCount}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {linkedTasks.map((task) => (
                      <Button key={task.id} size="sm" variant="outline" onClick={() => onInspectTask?.(task)}>
                        {task.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {template.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">描述</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {template.description}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">标题模板</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {template.title_template}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">内容模板</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {template.content_template}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Braces className="h-4 w-4" />
                模板变量
              </p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {formatJson(template.variables)}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">默认值</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {formatJson(template.default_values)}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
