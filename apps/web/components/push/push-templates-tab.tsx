"use client";

import { useMemo } from "react";
import { AlertTriangle, Eye, FileText, Loader2, Sparkles } from "lucide-react";
import { PushSectionEmpty, getChannelTypeLabel, getContentFormatLabel } from "@/components/push/push-shared";
import { PushTemplatePreviewPanel } from "@/components/push/push-template-preview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushTask, PushTemplate, PushTemplatePreview } from "@/types/push";

export function PushTemplatesTab({
  templateEnabledFilter,
  data,
  error,
  focusMode = "all",
  isLoading,
  onClearFocusMode,
  selectedTemplate,
  taskOptions,
  previewVariablesText,
  previewResult,
  previewError,
  previewingTemplateId,
  onTemplateEnabledChange,
  onTemplatePageChange,
  onTemplatePageSizeChange,
  onCreateTemplate,
  onSelectTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onViewTemplate,
  onPreviewVariablesTextChange,
  onPreview,
}: {
  templateEnabledFilter: string;
  data?: PaginatedResponse<PushTemplate>;
  error?: Error;
  focusMode?: "all" | "risk";
  isLoading: boolean;
  onClearFocusMode?: () => void;
  selectedTemplate: PushTemplate | null;
  taskOptions: PushTask[];
  previewVariablesText: string;
  previewResult: PushTemplatePreview | null;
  previewError: string | null;
  previewingTemplateId: string | null;
  onTemplateEnabledChange: (value: string) => void;
  onTemplatePageChange: (page: number) => void;
  onTemplatePageSizeChange: (size: number) => void;
  onCreateTemplate: () => void;
  onSelectTemplate: (template: PushTemplate) => void;
  onEditTemplate: (template: PushTemplate) => void;
  onDuplicateTemplate: (template: PushTemplate) => void;
  onDeleteTemplate: (template: PushTemplate) => void;
  onViewTemplate: (template: PushTemplate) => void;
  onPreviewVariablesTextChange: (value: string) => void;
  onPreview: () => void;
}) {
  const usageByTemplateId = useMemo(
    () =>
      taskOptions.reduce<Record<string, { total: number; enabled: number }>>((acc, task) => {
        if (!task.template_id) return acc;
        const current = acc[task.template_id] ?? { total: 0, enabled: 0 };
        current.total += 1;
        if (task.is_enabled) current.enabled += 1;
        acc[task.template_id] = current;
        return acc;
      }, {}),
    [taskOptions]
  );

  const displayItems = useMemo(
    () =>
      focusMode === "risk"
        ? (data?.items ?? []).filter((template) => !template.is_enabled && (usageByTemplateId[template.id]?.enabled ?? 0) > 0)
        : (data?.items ?? []),
    [data?.items, focusMode, usageByTemplateId]
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_380px]">
      <Card className="border-border/40 bg-background/50 py-0">
        <CardHeader className="flex flex-col gap-3 border-b border-border/60 py-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="text-base">模板库</CardTitle>
            <CardDescription>选择模板后会在右侧自动带入默认变量并支持即时预览。</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={templateEnabledFilter} onValueChange={(value) => onTemplateEnabledChange(value ?? "all")}>
              <SelectTrigger className="w-[120px] bg-background/70">
                <SelectValue placeholder="启用状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部模板</SelectItem>
                <SelectItem value="true">已启用</SelectItem>
                <SelectItem value="false">已停用</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={onCreateTemplate}>
              <Sparkles className="h-3.5 w-3.5" />
              新建模板
            </Button>
          </div>
        </CardHeader>

        {focusMode === "risk" && (
          <CardContent className="flex flex-col gap-3 border-b border-border/50 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">专注视图：模板依赖风险</p>
              <p className="text-xs text-muted-foreground">仅显示当前结果里仍被启用任务绑定的停用模板。</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClearFocusMode}>
              退出专注视图
            </Button>
          </CardContent>
        )}

        {error ? (
          <CardContent className="py-8 text-sm text-destructive">{error.message}</CardContent>
        ) : isLoading ? (
          <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在加载模板列表...
          </CardContent>
        ) : data?.items.length ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模板名称</TableHead>
                  <TableHead>适用渠道</TableHead>
                  <TableHead>引用情况</TableHead>
                  <TableHead>格式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayItems.map((template) => (
                  <TableRow key={template.id} data-state={selectedTemplate?.id === template.id ? "selected" : undefined}>
                    <TableCell className="max-w-[260px] whitespace-normal">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description || "暂无描述"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal text-muted-foreground">
                      {template.channel_types.map(getChannelTypeLabel).join("、")}
                    </TableCell>
                    <TableCell className="min-w-[220px] max-w-[280px] whitespace-normal">
                      <TemplateUsageCell template={template} usage={usageByTemplateId[template.id]} />
                    </TableCell>
                    <TableCell>{getContentFormatLabel(template.content_format)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={template.is_enabled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-border bg-muted/30 text-muted-foreground"}
                      >
                        {template.is_enabled ? "已启用" : "已停用"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => onSelectTemplate(template)}>
                          <Sparkles className="h-3.5 w-3.5" />
                          预览
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEditTemplate(template)}>
                          编辑
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDuplicateTemplate(template)}>
                          复制
                        </Button>
                        {!template.is_system && (
                          <Button size="sm" variant="outline" onClick={() => onDeleteTemplate(template)}>
                            删除
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => onViewTemplate(template)}>
                          <Eye className="h-3.5 w-3.5" />
                          详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              page={data.page}
              pageSize={data.page_size}
              total={data.total}
              totalPages={data.total_pages}
              onPageChange={onTemplatePageChange}
              onPageSizeChange={onTemplatePageSizeChange}
            />
          </>
        ) : (
          <CardContent className="pt-4">
            <PushSectionEmpty
              icon={FileText}
              title={focusMode === "risk" ? "当前结果里没有模板依赖风险" : "暂无模板"}
              description={focusMode === "risk" ? "可以退出专注视图，或扩大筛选范围后再看一轮。" : "当前筛选条件下未返回模板，可先放开筛选查看完整模板库。"}
            />
          </CardContent>
        )}
      </Card>

      <PushTemplatePreviewPanel
        selectedTemplate={selectedTemplate}
        previewVariablesText={previewVariablesText}
        previewResult={previewResult}
        previewError={previewError}
        previewingTemplateId={previewingTemplateId}
        onPreviewVariablesTextChange={onPreviewVariablesTextChange}
        onPreview={onPreview}
      />
    </div>
  );
}

function TemplateUsageCell({
  template,
  usage,
}: {
  template: PushTemplate;
  usage?: { total: number; enabled: number };
}) {
  const total = usage?.total ?? 0;
  const enabled = usage?.enabled ?? 0;
  const hasRisk = !template.is_enabled && enabled > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className={enabled > 0 ? "border-sky-500/20 bg-sky-500/10 text-sky-400" : "border-border bg-background/60 text-muted-foreground"}
        >
          任务 {total}
        </Badge>
        {template.is_system && (
          <Badge variant="outline" className="border-violet-500/20 bg-violet-500/10 text-violet-400">
            系统模板
          </Badge>
        )}
        {hasRisk && (
          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            风险
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {hasRisk
          ? `当前有 ${enabled} 个启用任务仍依赖这个已停用模板。`
          : total
            ? `共被 ${total} 个任务引用，其中 ${enabled} 个任务处于启用状态。`
            : "当前还没有任务引用这个模板。"}
      </p>
    </div>
  );
}
