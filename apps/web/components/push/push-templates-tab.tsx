"use client";

import { Eye, FileText, Loader2, Sparkles } from "lucide-react";
import { PushSectionEmpty, getChannelTypeLabel, getContentFormatLabel } from "@/components/push/push-shared";
import { PushTemplatePreviewPanel } from "@/components/push/push-template-preview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaginatedResponse } from "@/lib/api";
import type { PushTemplate, PushTemplatePreview } from "@/types/push";

export function PushTemplatesTab({
  templateEnabledFilter,
  data,
  error,
  isLoading,
  selectedTemplate,
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
  isLoading: boolean;
  selectedTemplate: PushTemplate | null;
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
                  <TableHead>格式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((template) => (
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
            <PushSectionEmpty icon={FileText} title="暂无模板" description="当前筛选条件下未返回模板，可先放开筛选查看完整模板库。" />
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
