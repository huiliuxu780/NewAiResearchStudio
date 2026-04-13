"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plus, Save, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PushChannel, PushChannelCreateData, PushChannelUpdateData } from "@/types/push";

const channelOptions = [
  { value: "feishu", label: "飞书" },
  { value: "email", label: "邮件" },
  { value: "dingtalk", label: "钉钉" },
  { value: "wechat_work", label: "企业微信" },
  { value: "slack", label: "Slack" },
];

const channelConfigGuides: Record<
  string,
  {
    mode: string;
    required: string[];
    optional: string[];
    tips: string[];
    sample: Record<string, unknown>;
  }
> = {
  feishu: {
    mode: "Webhook Bot 或 App 鉴权",
    required: ["webhook_url"],
    optional: ["secret", "app_id", "app_secret", "receive_id_type"],
    tips: [
      "最常用的是群机器人 webhook；如果走应用鉴权，至少需要 app_id 和 app_secret。",
      "receive_id_type 默认 open_id，只有走 App API 时才需要特别配置。",
    ],
    sample: {
      webhook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook-token",
      secret: "optional-sign-secret",
    },
  },
  email: {
    mode: "SMTP 登录",
    required: ["smtp_host", "smtp_port", "username", "password", "from_email"],
    optional: ["use_tls", "from_name"],
    tips: [
      "SMTP 是强约束型配置，缺少发件账号或发件邮箱时无法发送。",
      "from_name 不填也会有默认值，但建议显式配置，便于统一品牌展示。",
    ],
    sample: {
      smtp_host: "smtp.example.com",
      smtp_port: 587,
      use_tls: true,
      username: "sender@example.com",
      password: "app-password",
      from_name: "AI Research Platform",
      from_email: "noreply@example.com",
    },
  },
  dingtalk: {
    mode: "Webhook 机器人",
    required: ["webhook_url"],
    optional: ["secret"],
    tips: [
      "如果机器人启用了加签，secret 要和 webhook 配套填写。",
      "webhook_url 必须是完整的 access_token 地址。",
    ],
    sample: {
      webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=your-token",
      secret: "optional-sign-secret",
    },
  },
  wechat_work: {
    mode: "Webhook 机器人",
    required: ["webhook_url"],
    optional: ["mentioned_list"],
    tips: [
      "mentioned_list 适合 @all 或指定成员提醒，不填也能正常发送。",
      "企业微信这里走的是机器人 webhook，不需要 corp secret 一类的后台凭证。",
    ],
    sample: {
      webhook_url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-key",
      mentioned_list: ["@all"],
    },
  },
  slack: {
    mode: "Incoming Webhook 或 Bot Token",
    required: ["webhook_url"],
    optional: ["bot_token", "channel"],
    tips: [
      "Webhook 路径最简单；如果要按接收方动态路由，可改用 bot_token。",
      "channel 在 webhook 模式下主要是默认展示值，在 bot_token 模式下会作为后备频道。",
    ],
    sample: {
      webhook_url: "https://hooks.slack.com/services/T000/B000/your-token",
      channel: "#alerts",
    },
  },
};

export function PushChannelEditorSheet({
  channel,
  initialChannel,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: {
  channel: PushChannel | null;
  initialChannel?: PushChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PushChannelCreateData | PushChannelUpdateData) => void;
  isSaving?: boolean;
}) {
  const formKey = `${channel?.id ?? `copy-${initialChannel?.id ?? "new"}`}-${open ? "open" : "closed"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl">
        <PushChannelEditorForm
          key={formKey}
          channel={channel}
          initialChannel={initialChannel}
          onOpenChange={onOpenChange}
          onSave={onSave}
          isSaving={isSaving}
        />
      </SheetContent>
    </Sheet>
  );
}

function PushChannelEditorForm({
  channel,
  initialChannel,
  onOpenChange,
  onSave,
  isSaving,
}: {
  channel: PushChannel | null;
  initialChannel?: PushChannel | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PushChannelCreateData | PushChannelUpdateData) => void;
  isSaving: boolean;
}) {
  const isEditing = Boolean(channel);
  const sourceChannel = channel ?? initialChannel ?? null;
  const [name, setName] = useState(channel?.name ?? (initialChannel ? `${initialChannel.name} - 副本` : ""));
  const [channelType, setChannelType] = useState(sourceChannel?.channel_type ?? "feishu");
  const [description, setDescription] = useState(sourceChannel?.description ?? "");
  const [configText, setConfigText] = useState(JSON.stringify(sourceChannel?.config ?? {}, null, 2));
  const [isEnabled, setIsEnabled] = useState(sourceChannel?.is_enabled ?? true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const configGuide = channelConfigGuides[channelType];

  const isFormValid = useMemo(() => Boolean(name.trim() && channelType.trim() && configText.trim()), [channelType, configText, name]);
  const parsedConfig = useMemo(() => {
    try {
      return parseConfigJson(configText);
    } catch {
      return null;
    }
  }, [configText]);
  const missingRequiredFields = useMemo(() => {
    if (!parsedConfig) return [];
    return configGuide.required.filter((key) => isConfigValueMissing(parsedConfig[key]));
  }, [configGuide.required, parsedConfig]);

  function applySampleConfig() {
    setConfigText(JSON.stringify(configGuide.sample, null, 2));
    setJsonError(null);
  }

  function handleSave() {
    setJsonError(null);

    try {
      const config = parseConfigJson(configText);

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        config,
        ...(isEditing ? { is_enabled: isEnabled } : { channel_type: channelType }),
      };

      onSave(payload);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "配置 JSON 格式不正确");
    }
  }

  return (
    <>
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle>{isEditing ? "编辑推送渠道" : initialChannel ? "复制推送渠道" : "新建推送渠道"}</SheetTitle>
        <SheetDescription>
          {isEditing
            ? "更新渠道配置、说明和启用状态。"
            : initialChannel
              ? "基于现有渠道快速生成一份副本，再按接收对象或凭证做微调。"
              : "创建新的推送渠道配置，供任务和模板编排使用。"}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-9rem)] px-6 py-5">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="push-channel-name">渠道名称</Label>
            <Input
              id="push-channel-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：飞书机器人-运营群"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-channel-type">渠道类型</Label>
            <Select value={channelType} onValueChange={(value) => setChannelType(value ?? "feishu")} disabled={isEditing}>
              <SelectTrigger id="push-channel-type">
                <SelectValue placeholder="选择渠道类型" />
              </SelectTrigger>
              <SelectContent>
                {channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing && <p className="text-xs text-muted-foreground">已创建的渠道不支持直接修改类型，避免和后端配置产生偏差。</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-channel-description">描述</Label>
            <Textarea
              id="push-channel-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="说明这个渠道连接到哪个群组、邮箱或机器人"
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-channel-config">渠道配置 JSON</Label>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{configGuide.mode}</p>
                  <p className="mt-1 text-xs text-muted-foreground">按当前渠道类型展示最小可用配置，减少和后端驱动要求对不齐的情况。</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={applySampleConfig}>
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  填充示例
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">必填字段</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {configGuide.required.map((field) => (
                      <Badge key={field} variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                {!!configGuide.optional.length && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">可选字段</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {configGuide.optional.map((field) => (
                        <Badge key={field} variant="outline" className="border-border bg-background/60 text-muted-foreground">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs text-muted-foreground">
                  {configGuide.tips.map((tip) => (
                    <p key={tip}>{tip}</p>
                  ))}
                </div>
              </div>
            </div>
            <Textarea
              id="push-channel-config"
              value={configText}
              onChange={(event) => setConfigText(event.target.value)}
              placeholder='例如：{"webhook_url":"https://..."}'
              className="min-h-56 font-mono text-xs"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">保持和后端渠道驱动要求一致，例如 webhook 地址、认证 token、发件人信息等。</p>
          </div>

          {parsedConfig && (
            <div
              className={
                missingRequiredFields.length
                  ? "rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-sm text-amber-700 dark:text-amber-300"
                  : "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-700 dark:text-emerald-300"
              }
            >
              <div className="flex items-start gap-2">
                {missingRequiredFields.length ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    {missingRequiredFields.length
                      ? `当前还缺少 ${missingRequiredFields.length} 个关键字段`
                      : "基础配置字段已齐全"}
                  </p>
                  <p className="mt-1 text-xs">
                    {missingRequiredFields.length
                      ? `建议补齐：${missingRequiredFields.join("、")}`
                      : "至少从最小必填项看，已经满足当前渠道驱动的基础要求。"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {jsonError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {jsonError}
            </div>
          )}

          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">启用渠道</p>
                <p className="mt-1 text-xs text-muted-foreground">停用后任务仍会保留引用，但不会继续通过该渠道发送。</p>
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
              {isEditing ? "保存变更" : "创建渠道"}
            </>
          )}
        </Button>
      </SheetFooter>
    </>
  );
}

function parseConfigJson(value: string) {
  const parsed = value.trim() ? JSON.parse(value) : {};
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("渠道配置必须是 JSON 对象。");
  }
  return parsed as Record<string, unknown>;
}

function isConfigValueMissing(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
