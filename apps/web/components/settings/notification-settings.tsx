"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/settings/settings-section";
import { useNotificationSettings, useTestNotification } from "@/hooks/use-settings";
import {
  Bell,
  Mail,
  Webhook,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  CheckSquare,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface NotificationFormData {
  email_enabled: boolean;
  webhook_enabled: boolean;
  webhook_url: string;
  notify_on_task_complete: boolean;
  notify_on_error: boolean;
  notify_on_daily_report: boolean;
}

const defaultFormData: NotificationFormData = {
  email_enabled: false,
  webhook_enabled: false,
  webhook_url: "",
  notify_on_task_complete: true,
  notify_on_error: true,
  notify_on_daily_report: false,
};

export function NotificationSettings({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { data, isLoading, isSaving, update } = useNotificationSettings();
  const { trigger: testNotification, isMutating: isTesting } = useTestNotification();

  const [formData, setFormData] = React.useState<NotificationFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof NotificationFormData, string>>>({});
  const [isDirty, setIsDirty] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Sync data from server
  React.useEffect(() => {
    if (data) {
      setFormData({
        email_enabled: data.email_enabled ?? defaultFormData.email_enabled,
        webhook_enabled: data.webhook_enabled ?? defaultFormData.webhook_enabled,
        webhook_url: data.webhook_url ?? "",
        notify_on_task_complete: data.notify_on_task_complete ?? defaultFormData.notify_on_task_complete,
        notify_on_error: data.notify_on_error ?? defaultFormData.notify_on_error,
        notify_on_daily_report: data.notify_on_daily_report ?? defaultFormData.notify_on_daily_report,
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [data]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NotificationFormData, string>> = {};

    if (formData.webhook_enabled && formData.webhook_url.trim()) {
      if (!/^https?:\/\/.+/.test(formData.webhook_url)) {
        newErrors.webhook_url = "Webhook URL 必须以 http:// 或 https:// 开头";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NotificationFormData, value: boolean | string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await update(formData);
      setIsDirty(false);
    } catch {
      // Error handled by SWR
    }
  };

  const handleReset = () => {
    if (data) {
      setFormData({
        email_enabled: data.email_enabled ?? defaultFormData.email_enabled,
        webhook_enabled: data.webhook_enabled ?? defaultFormData.webhook_enabled,
        webhook_url: data.webhook_url ?? "",
        notify_on_task_complete: data.notify_on_task_complete ?? defaultFormData.notify_on_task_complete,
        notify_on_error: data.notify_on_error ?? defaultFormData.notify_on_error,
        notify_on_daily_report: data.notify_on_daily_report ?? defaultFormData.notify_on_daily_report,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
    setIsDirty(false);
    setTestResult(null);
  };

  const handleTestNotification = async () => {
    setTestResult(null);
    try {
      const result = await testNotification();
      setTestResult({ success: result.success, message: result.message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "测试通知失败";
      setTestResult({ success: false, message });
    }
  };

  return (
    <SettingsSection
      title="通知设置"
      description="配置系统通知方式和触发条件"
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
      onReset={handleReset}
      saveDisabled={!isDirty}
      className={className}
    >
      {/* Email Notifications */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="email_enabled" className="text-sm font-medium">
              邮件通知
            </Label>
            <p className="text-xs text-muted-foreground">
              通过电子邮件接收系统通知
            </p>
          </div>
        </div>
        <Switch
          id="email_enabled"
          checked={formData.email_enabled}
          onCheckedChange={(checked: boolean) => handleChange("email_enabled", checked)}
        />
      </div>

      {/* Webhook Notifications */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Webhook className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="webhook_enabled" className="text-sm font-medium">
              Webhook 通知
            </Label>
            <p className="text-xs text-muted-foreground">
              通过 Webhook 向外部服务发送通知
            </p>
          </div>
        </div>
        <Switch
          id="webhook_enabled"
          checked={formData.webhook_enabled}
          onCheckedChange={(checked: boolean) => handleChange("webhook_enabled", checked)}
        />
      </div>

      {/* Webhook URL */}
      {formData.webhook_enabled && (
        <div className="space-y-2 pl-8">
          <Label htmlFor="webhook_url" className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-muted-foreground" />
            Webhook URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="webhook_url"
              type="url"
              value={formData.webhook_url}
              onChange={(e) => handleChange("webhook_url", e.target.value)}
              placeholder="https://hooks.example.com/your-webhook-url"
              aria-invalid={!!errors.webhook_url}
              aria-describedby={errors.webhook_url ? "webhook_url-error" : undefined}
              className={cn("flex-1 font-mono text-xs", errors.webhook_url && "border-destructive")}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={isTesting || !formData.webhook_url.trim()}
            >
              {isTesting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-3.5 w-3.5" />
              )}
              测试
            </Button>
          </div>
          {errors.webhook_url && (
            <p id="webhook_url-error" className="text-xs text-destructive" role="alert">
              {errors.webhook_url}
            </p>
          )}
          {testResult && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-xs",
                testResult.success
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 text-destructive"
              )}
              role="alert"
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {testResult.message}
            </div>
          )}
        </div>
      )}

      {/* Notification Triggers */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4 text-muted-foreground" />
          通知触发条件
        </Label>

        {/* Task Complete */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm">任务完成通知</p>
              <p className="text-xs text-muted-foreground">
                当采集任务完成时发送通知
              </p>
            </div>
          </div>
          <Switch
            id="notify_on_task_complete"
            checked={formData.notify_on_task_complete}
            onCheckedChange={(checked: boolean) => handleChange("notify_on_task_complete", checked)}
          />
        </div>

        {/* Error Notification */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm">错误通知</p>
              <p className="text-xs text-muted-foreground">
                当系统发生错误时发送通知
              </p>
            </div>
          </div>
          <Switch
            id="notify_on_error"
            checked={formData.notify_on_error}
            onCheckedChange={(checked: boolean) => handleChange("notify_on_error", checked)}
          />
        </div>

        {/* Daily Report */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm">每日报告通知</p>
              <p className="text-xs text-muted-foreground">
                每日定时发送系统运行报告
              </p>
            </div>
          </div>
          <Switch
            id="notify_on_daily_report"
            checked={formData.notify_on_daily_report}
            onCheckedChange={(checked: boolean) => handleChange("notify_on_daily_report", checked)}
          />
        </div>
      </div>
    </SettingsSection>
  );
}
