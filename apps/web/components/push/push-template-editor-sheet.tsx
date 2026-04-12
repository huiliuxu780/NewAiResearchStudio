"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PushTemplate, PushTemplateCreateData, PushTemplateUpdateData } from "@/types/push";

const channelOptions = [
  { value: "feishu", label: "飞书" },
  { value: "email", label: "邮件" },
  { value: "dingtalk", label: "钉钉" },
  { value: "wechat_work", label: "企业微信" },
  { value: "slack", label: "Slack" },
];

const formatOptions = [
  { value: "text", label: "文本" },
  { value: "html", label: "HTML" },
  { value: "markdown", label: "Markdown" },
  { value: "rich_text", label: "富文本" },
];

export function PushTemplateEditorSheet({
  template,
  initialTemplate,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: {
  template: PushTemplate | null;
  initialTemplate?: PushTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PushTemplateCreateData | PushTemplateUpdateData) => void;
  isSaving?: boolean;
}) {
  const formKey = `${template?.id ?? `copy-${initialTemplate?.id ?? "new"}`}-${open ? "open" : "closed"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl">
        <PushTemplateEditorForm
          key={formKey}
          template={template}
          initialTemplate={initialTemplate}
          onOpenChange={onOpenChange}
          onSave={onSave}
          isSaving={isSaving}
        />
      </SheetContent>
    </Sheet>
  );
}

function PushTemplateEditorForm({
  template,
  initialTemplate,
  onOpenChange,
  onSave,
  isSaving,
}: {
  template: PushTemplate | null;
  initialTemplate?: PushTemplate | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PushTemplateCreateData | PushTemplateUpdateData) => void;
  isSaving: boolean;
}) {
  const isEditing = Boolean(template);
  const sourceTemplate = template ?? initialTemplate ?? null;
  const [name, setName] = useState(template?.name ?? (initialTemplate ? `${initialTemplate.name} - 副本` : ""));
  const [description, setDescription] = useState(sourceTemplate?.description ?? "");
  const [channelTypes, setChannelTypes] = useState<string[]>(sourceTemplate?.channel_types ?? []);
  const [contentFormat, setContentFormat] = useState(sourceTemplate?.content_format ?? "text");
  const [titleTemplate, setTitleTemplate] = useState(sourceTemplate?.title_template ?? "");
  const [contentTemplate, setContentTemplate] = useState(sourceTemplate?.content_template ?? "");
  const [variablesText, setVariablesText] = useState(JSON.stringify(sourceTemplate?.variables ?? {}, null, 2));
  const [defaultValuesText, setDefaultValuesText] = useState(JSON.stringify(sourceTemplate?.default_values ?? {}, null, 2));
  const [isEnabled, setIsEnabled] = useState(sourceTemplate?.is_enabled ?? true);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    return Boolean(name.trim() && titleTemplate.trim() && contentTemplate.trim() && channelTypes.length > 0);
  }, [channelTypes.length, contentTemplate, name, titleTemplate]);

  function toggleChannelType(value: string) {
    setChannelTypes((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  function handleSave() {
    setJsonError(null);

    try {
      const variables = parseRecordJson(variablesText);
      const defaultValues = parseRecordJson(defaultValuesText);

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        channel_types: channelTypes,
        title_template: titleTemplate,
        content_template: contentTemplate,
        content_format: contentFormat,
        variables,
        default_values: defaultValues,
        ...(isEditing ? { is_enabled: isEnabled } : {}),
      };

      onSave(payload);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "JSON 格式不正确");
    }
  }

  return (
    <>
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle>{isEditing ? "编辑推送模板" : initialTemplate ? "复制推送模板" : "新建推送模板"}</SheetTitle>
        <SheetDescription>
          {isEditing
            ? "更新模板内容、变量定义和启用状态。"
            : initialTemplate
              ? "基于现有模板快速生成一个副本，再按场景改出新版本。"
              : "创建可供任务复用的推送模板。"}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-9rem)] px-6 py-5">
        <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="push-template-name">模板名称</Label>
              <Input id="push-template-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：周报发布通知" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="push-template-description">描述</Label>
              <Textarea
                id="push-template-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="说明这个模板适合什么场景"
                className="min-h-20"
              />
            </div>

            <div className="space-y-3">
              <Label>适用渠道</Label>
              <div className="flex flex-wrap gap-2">
                {channelOptions.map((option) => {
                  const selected = channelTypes.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleChannelType(option.value)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="push-template-format">内容格式</Label>
              <Select value={contentFormat} onValueChange={(value) => setContentFormat(value ?? "text")}>
                <SelectTrigger id="push-template-format">
                  <SelectValue placeholder="选择内容格式" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="push-template-title">标题模板</Label>
              <Input
                id="push-template-title"
                value={titleTemplate}
                onChange={(event) => setTitleTemplate(event.target.value)}
                placeholder="例如：{report_title} 已生成"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="push-template-content">内容模板</Label>
              <Textarea
                id="push-template-content"
                value={contentTemplate}
                onChange={(event) => setContentTemplate(event.target.value)}
                placeholder="输入完整内容模板，支持变量插值"
                className="min-h-40 font-mono text-sm"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="push-template-variables">变量定义 JSON</Label>
              <Textarea
                id="push-template-variables"
                value={variablesText}
                onChange={(event) => setVariablesText(event.target.value)}
                className="min-h-32 font-mono text-xs"
                spellCheck={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="push-template-defaults">默认值 JSON</Label>
              <Textarea
                id="push-template-defaults"
                value={defaultValuesText}
                onChange={(event) => setDefaultValuesText(event.target.value)}
                className="min-h-32 font-mono text-xs"
                spellCheck={false}
              />
            </div>

            {jsonError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {jsonError}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">启用模板</p>
                  <p className="mt-1 text-xs text-muted-foreground">停用后任务将无法继续使用该模板。</p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>
            )}
        </div>
      </ScrollArea>

      <SheetFooter className="border-t px-6 py-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={!isFormValid || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isEditing ? "保存变更" : "创建模板"}
            </>
          )}
        </Button>
      </SheetFooter>
    </>
  );
}

function parseRecordJson(value: string) {
  const parsed = value.trim() ? JSON.parse(value) : {};
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("变量定义和默认值都必须是 JSON 对象。");
  }
  return parsed as Record<string, unknown>;
}
