"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "@/components/settings/settings-section";
import { useSystemSettings } from "@/hooks/use-settings";
import {
  Settings2,
  ListOrdered,
  Layers,
  Cpu,
  Timer,
  Database,
  Bug,
} from "lucide-react";

interface SystemFormData {
  page_size: number;
  batch_size: number;
  max_concurrent_tasks: number;
  task_timeout_seconds: number;
  cache_ttl_seconds: number;
  enable_debug_mode: boolean;
}

const defaultFormData: SystemFormData = {
  page_size: 20,
  batch_size: 100,
  max_concurrent_tasks: 5,
  task_timeout_seconds: 300,
  cache_ttl_seconds: 3600,
  enable_debug_mode: false,
};

export function SystemSettings({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { data, isLoading, isSaving, update } = useSystemSettings();

  const [formData, setFormData] = React.useState<SystemFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof SystemFormData, string>>>({});
  const [isDirty, setIsDirty] = React.useState(false);

  // Sync data from server
  React.useEffect(() => {
    if (data) {
      setFormData({
        page_size: data.page_size ?? defaultFormData.page_size,
        batch_size: data.batch_size ?? defaultFormData.batch_size,
        max_concurrent_tasks: data.max_concurrent_tasks ?? defaultFormData.max_concurrent_tasks,
        task_timeout_seconds: data.task_timeout_seconds ?? defaultFormData.task_timeout_seconds,
        cache_ttl_seconds: data.cache_ttl_seconds ?? defaultFormData.cache_ttl_seconds,
        enable_debug_mode: data.enable_debug_mode ?? defaultFormData.enable_debug_mode,
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [data]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SystemFormData, string>> = {};

    if (formData.page_size < 1 || formData.page_size > 100) {
      newErrors.page_size = "分页大小必须在 1 到 100 之间";
    }

    if (formData.batch_size < 1 || formData.batch_size > 1000) {
      newErrors.batch_size = "批量处理大小必须在 1 到 1000 之间";
    }

    if (formData.max_concurrent_tasks < 1 || formData.max_concurrent_tasks > 20) {
      newErrors.max_concurrent_tasks = "最大并发任务数必须在 1 到 20 之间";
    }

    if (formData.task_timeout_seconds < 10 || formData.task_timeout_seconds > 3600) {
      newErrors.task_timeout_seconds = "任务超时时间必须在 10 到 3600 秒之间";
    }

    if (formData.cache_ttl_seconds < 0 || formData.cache_ttl_seconds > 86400) {
      newErrors.cache_ttl_seconds = "缓存过期时间必须在 0 到 86400 秒之间";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof SystemFormData, value: number | boolean) => {
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
        page_size: data.page_size ?? defaultFormData.page_size,
        batch_size: data.batch_size ?? defaultFormData.batch_size,
        max_concurrent_tasks: data.max_concurrent_tasks ?? defaultFormData.max_concurrent_tasks,
        task_timeout_seconds: data.task_timeout_seconds ?? defaultFormData.task_timeout_seconds,
        cache_ttl_seconds: data.cache_ttl_seconds ?? defaultFormData.cache_ttl_seconds,
        enable_debug_mode: data.enable_debug_mode ?? defaultFormData.enable_debug_mode,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
    setIsDirty(false);
  };

  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) return `${seconds} 秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟`;
    return `${(seconds / 3600).toFixed(1)} 小时`;
  };

  return (
    <SettingsSection
      title="系统参数"
      description="配置系统运行参数，影响性能和行为"
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
      onReset={handleReset}
      saveDisabled={!isDirty}
      className={className}
    >
      {/* Page Size */}
      <div className="space-y-2">
        <Label htmlFor="page_size" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
            分页大小
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.page_size} 条/页
          </span>
        </Label>
        <Input
          id="page_size"
          type="number"
          step="1"
          min="1"
          max="100"
          value={formData.page_size}
          onChange={(e) => handleChange("page_size", parseInt(e.target.value, 10) || 1)}
          aria-invalid={!!errors.page_size}
          aria-describedby={errors.page_size ? "page_size-error" : undefined}
          className={cn("font-mono", errors.page_size && "border-destructive")}
        />
        {errors.page_size && (
          <p id="page_size-error" className="text-xs text-destructive" role="alert">
            {errors.page_size}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          列表页面每页显示的数据条数
        </p>
      </div>

      {/* Batch Size */}
      <div className="space-y-2">
        <Label htmlFor="batch_size" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            批量处理大小
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.batch_size.toLocaleString()} 条/批
          </span>
        </Label>
        <Input
          id="batch_size"
          type="number"
          step="1"
          min="1"
          max="1000"
          value={formData.batch_size}
          onChange={(e) => handleChange("batch_size", parseInt(e.target.value, 10) || 1)}
          aria-invalid={!!errors.batch_size}
          aria-describedby={errors.batch_size ? "batch_size-error" : undefined}
          className={cn("font-mono", errors.batch_size && "border-destructive")}
        />
        {errors.batch_size && (
          <p id="batch_size-error" className="text-xs text-destructive" role="alert">
            {errors.batch_size}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          批量处理数据时每批处理的数据条数
        </p>
      </div>

      {/* Max Concurrent Tasks */}
      <div className="space-y-2">
        <Label htmlFor="max_concurrent_tasks" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            最大并发任务数
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.max_concurrent_tasks} 个
          </span>
        </Label>
        <Input
          id="max_concurrent_tasks"
          type="number"
          step="1"
          min="1"
          max="20"
          value={formData.max_concurrent_tasks}
          onChange={(e) => handleChange("max_concurrent_tasks", parseInt(e.target.value, 10) || 1)}
          aria-invalid={!!errors.max_concurrent_tasks}
          aria-describedby={errors.max_concurrent_tasks ? "max_concurrent_tasks-error" : undefined}
          className={cn("font-mono", errors.max_concurrent_tasks && "border-destructive")}
        />
        {errors.max_concurrent_tasks && (
          <p id="max_concurrent_tasks-error" className="text-xs text-destructive" role="alert">
            {errors.max_concurrent_tasks}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          同时运行的最大任务数量，过高可能导致系统资源不足
        </p>
      </div>

      {/* Task Timeout */}
      <div className="space-y-2">
        <Label htmlFor="task_timeout_seconds" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            任务超时时间
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatSeconds(formData.task_timeout_seconds)}
          </span>
        </Label>
        <Input
          id="task_timeout_seconds"
          type="number"
          step="10"
          min="10"
          max="3600"
          value={formData.task_timeout_seconds}
          onChange={(e) => handleChange("task_timeout_seconds", parseInt(e.target.value, 10) || 10)}
          aria-invalid={!!errors.task_timeout_seconds}
          aria-describedby={errors.task_timeout_seconds ? "task_timeout_seconds-error" : undefined}
          className={cn("font-mono", errors.task_timeout_seconds && "border-destructive")}
        />
        {errors.task_timeout_seconds && (
          <p id="task_timeout_seconds-error" className="text-xs text-destructive" role="alert">
            {errors.task_timeout_seconds}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          单个任务的最大执行时间，超过此时间任务将被终止
        </p>
      </div>

      {/* Cache TTL */}
      <div className="space-y-2">
        <Label htmlFor="cache_ttl_seconds" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            缓存过期时间
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatSeconds(formData.cache_ttl_seconds)}
          </span>
        </Label>
        <Input
          id="cache_ttl_seconds"
          type="number"
          step="60"
          min="0"
          max="86400"
          value={formData.cache_ttl_seconds}
          onChange={(e) => handleChange("cache_ttl_seconds", parseInt(e.target.value, 10) || 0)}
          aria-invalid={!!errors.cache_ttl_seconds}
          aria-describedby={errors.cache_ttl_seconds ? "cache_ttl_seconds-error" : undefined}
          className={cn("font-mono", errors.cache_ttl_seconds && "border-destructive")}
        />
        {errors.cache_ttl_seconds && (
          <p id="cache_ttl_seconds-error" className="text-xs text-destructive" role="alert">
            {errors.cache_ttl_seconds}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          数据缓存的有效期，设置为 0 表示禁用缓存
        </p>
      </div>

      {/* Debug Mode */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Bug className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="enable_debug_mode" className="text-sm font-medium">
              调试模式
            </Label>
            <p className="text-xs text-muted-foreground">
              启用详细的日志输出和调试信息，生产环境建议关闭
            </p>
          </div>
        </div>
        <Switch
          id="enable_debug_mode"
          checked={formData.enable_debug_mode}
          onCheckedChange={(checked: boolean) => handleChange("enable_debug_mode", checked)}
        />
      </div>
    </SettingsSection>
  );
}
