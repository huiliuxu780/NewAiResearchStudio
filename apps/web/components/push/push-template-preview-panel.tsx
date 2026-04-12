"use client";

import { FileText, Loader2, Sparkles } from "lucide-react";
import { PushDetailRow, PushSectionEmpty, getChannelTypeLabel, getContentFormatLabel } from "@/components/push/push-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { PushTemplate, PushTemplatePreview } from "@/types/push";

export function PushTemplatePreviewPanel({
  selectedTemplate,
  previewVariablesText,
  previewResult,
  previewError,
  previewingTemplateId,
  onPreviewVariablesTextChange,
  onPreview,
}: {
  selectedTemplate: PushTemplate | null;
  previewVariablesText: string;
  previewResult: PushTemplatePreview | null;
  previewError: string | null;
  previewingTemplateId: string | null;
  onPreviewVariablesTextChange: (value: string) => void;
  onPreview: () => void;
}) {
  return (
    <Card className="border-border/40 bg-background/60">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-base">模板预览</CardTitle>
        <CardDescription>默认值会自动带入，你也可以直接修改 JSON 变量重新渲染。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {selectedTemplate ? (
          <>
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedTemplate.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedTemplate.description || "使用模板默认值快速验证标题与正文渲染效果。"}
                  </p>
                </div>
                <Badge variant="outline" className="border-border bg-background/80 text-muted-foreground">
                  {getContentFormatLabel(selectedTemplate.content_format)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTemplate.channel_types.map((channelType) => (
                  <Badge key={channelType} variant="outline" className="border-border bg-background/80 text-muted-foreground">
                    {getChannelTypeLabel(channelType)}
                  </Badge>
                ))}
              </div>

              <PushDetailRow icon={FileText} label="变量定义" value={String(Object.keys(selectedTemplate.variables ?? {}).length)} />
              <PushDetailRow icon={FileText} label="默认值字段" value={String(Object.keys(selectedTemplate.default_values ?? {}).length)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">变量 JSON</p>
                <Button size="sm" variant="secondary" disabled={previewingTemplateId === selectedTemplate.id} onClick={onPreview}>
                  {previewingTemplateId === selectedTemplate.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  重新渲染
                </Button>
              </div>

              <Textarea
                value={previewVariablesText}
                onChange={(event) => onPreviewVariablesTextChange(event.target.value)}
                className="min-h-44 font-mono text-xs"
                spellCheck={false}
              />

              {previewError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {previewError}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                渲染结果
              </div>

              {previewResult ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">标题</p>
                    <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm text-foreground">
                      {previewResult.rendered_title}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">正文</p>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/80 px-3 py-3 text-xs text-foreground">
                      {previewResult.rendered_content}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
                  选择模板后会自动尝试一次预览；你也可以修改变量后点击“重新渲染”。
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">模板原文</p>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.18em]">标题模板</p>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/80 px-3 py-2">
                    {selectedTemplate.title_template}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.18em]">内容模板</p>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/80 px-3 py-2">
                    {selectedTemplate.content_template}
                  </pre>
                </div>
              </div>
            </div>
          </>
        ) : (
          <PushSectionEmpty
            icon={FileText}
            title="选择一个模板开始预览"
            description="右侧会展示默认变量、渲染结果和模板原文，方便你快速验证推送文案。"
          />
        )}
      </CardContent>
    </Card>
  );
}
