"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSection } from "@/components/settings/settings-section";
import { useAiDefaultSettings } from "@/hooks/use-settings";
import { Brain, Thermometer, Hash, Percent, SlidersHorizontal } from "lucide-react";

// Common AI models list
const AI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "qwen-max", label: "Qwen Max" },
  { value: "qwen-plus", label: "Qwen Plus" },
  { value: "deepseek-chat", label: "DeepSeek Chat" },
];

interface AiDefaultFormData {
  default_model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

const defaultFormData: AiDefaultFormData = {
  default_model: "gpt-4o",
  temperature: 0.7,
  max_tokens: 2048,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

export function AiDefaultSettings({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { data, isLoading, isSaving, update } = useAiDefaultSettings();

  const [formData, setFormData] = React.useState<AiDefaultFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof AiDefaultFormData, string>>>({});
  const [isDirty, setIsDirty] = React.useState(false);

  // Sync data from server
  React.useEffect(() => {
    if (data) {
      setFormData({
        default_model: data.default_model ?? defaultFormData.default_model,
        temperature: data.temperature ?? defaultFormData.temperature,
        max_tokens: data.max_tokens ?? defaultFormData.max_tokens,
        top_p: data.top_p ?? defaultFormData.top_p,
        frequency_penalty: data.frequency_penalty ?? defaultFormData.frequency_penalty,
        presence_penalty: data.presence_penalty ?? defaultFormData.presence_penalty,
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [data]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AiDefaultFormData, string>> = {};

    if (!formData.default_model) {
      newErrors.default_model = "请选择默认模型";
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = "温度值必须在 0 到 2 之间";
    }

    if (formData.max_tokens < 1 || formData.max_tokens > 128000) {
      newErrors.max_tokens = "最大 Token 数必须在 1 到 128000 之间";
    }

    if (formData.top_p < 0 || formData.top_p > 1) {
      newErrors.top_p = "Top P 值必须在 0 到 1 之间";
    }

    if (formData.frequency_penalty < -2 || formData.frequency_penalty > 2) {
      newErrors.frequency_penalty = "频率惩罚值必须在 -2 到 2 之间";
    }

    if (formData.presence_penalty < -2 || formData.presence_penalty > 2) {
      newErrors.presence_penalty = "存在惩罚值必须在 -2 到 2 之间";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof AiDefaultFormData, value: string | number) => {
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
        default_model: data.default_model ?? defaultFormData.default_model,
        temperature: data.temperature ?? defaultFormData.temperature,
        max_tokens: data.max_tokens ?? defaultFormData.max_tokens,
        top_p: data.top_p ?? defaultFormData.top_p,
        frequency_penalty: data.frequency_penalty ?? defaultFormData.frequency_penalty,
        presence_penalty: data.presence_penalty ?? defaultFormData.presence_penalty,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
    setIsDirty(false);
  };

  return (
    <SettingsSection
      title="AI 模型默认配置"
      description="设置 AI 模型的默认参数，这些参数将作为所有 AI 请求的基准配置"
      isLoading={isLoading}
      isSaving={isSaving}
      onSave={handleSave}
      onReset={handleReset}
      saveDisabled={!isDirty}
      className={className}
    >
      {/* Default Model */}
      <div className="space-y-2">
        <Label htmlFor="default_model" className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          默认模型
        </Label>
        <Select
          value={formData.default_model}
          onValueChange={(value: string | null) => {
            if (value) handleChange("default_model", value);
          }}
        >
          <SelectTrigger
            id="default_model"
            className={cn(errors.default_model && "border-destructive")}
            aria-invalid={!!errors.default_model}
            aria-describedby={errors.default_model ? "default_model-error" : undefined}
          >
            <SelectValue placeholder="选择默认模型" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.default_model && (
          <p id="default_model-error" className="text-xs text-destructive" role="alert">
            {errors.default_model}
          </p>
        )}
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <Label htmlFor="temperature" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            温度 (Temperature)
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.temperature.toFixed(2)}
          </span>
        </Label>
        <Input
          id="temperature"
          type="number"
          step="0.01"
          min="0"
          max="2"
          value={formData.temperature}
          onChange={(e) => handleChange("temperature", parseFloat(e.target.value) || 0)}
          aria-invalid={!!errors.temperature}
          aria-describedby={errors.temperature ? "temperature-error" : undefined}
          className={cn("font-mono", errors.temperature && "border-destructive")}
        />
        {errors.temperature && (
          <p id="temperature-error" className="text-xs text-destructive" role="alert">
            {errors.temperature}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          控制输出的随机性：较低的值使输出更确定，较高的值使输出更有创意
        </p>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <Label htmlFor="max_tokens" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            最大 Token 数
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.max_tokens.toLocaleString()}
          </span>
        </Label>
        <Input
          id="max_tokens"
          type="number"
          step="1"
          min="1"
          max="128000"
          value={formData.max_tokens}
          onChange={(e) => handleChange("max_tokens", parseInt(e.target.value, 10) || 1)}
          aria-invalid={!!errors.max_tokens}
          aria-describedby={errors.max_tokens ? "max_tokens-error" : undefined}
          className={cn("font-mono", errors.max_tokens && "border-destructive")}
        />
        {errors.max_tokens && (
          <p id="max_tokens-error" className="text-xs text-destructive" role="alert">
            {errors.max_tokens}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          单次响应生成的最大 Token 数量
        </p>
      </div>

      {/* Top P */}
      <div className="space-y-2">
        <Label htmlFor="top_p" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            Top P
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.top_p.toFixed(2)}
          </span>
        </Label>
        <Input
          id="top_p"
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={formData.top_p}
          onChange={(e) => handleChange("top_p", parseFloat(e.target.value) || 0)}
          aria-invalid={!!errors.top_p}
          aria-describedby={errors.top_p ? "top_p-error" : undefined}
          className={cn("font-mono", errors.top_p && "border-destructive")}
        />
        {errors.top_p && (
          <p id="top_p-error" className="text-xs text-destructive" role="alert">
            {errors.top_p}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          核采样参数：控制模型考虑的词汇范围
        </p>
      </div>

      {/* Frequency Penalty */}
      <div className="space-y-2">
        <Label htmlFor="frequency_penalty" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            频率惩罚 (Frequency Penalty)
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.frequency_penalty.toFixed(2)}
          </span>
        </Label>
        <Input
          id="frequency_penalty"
          type="number"
          step="0.01"
          min="-2"
          max="2"
          value={formData.frequency_penalty}
          onChange={(e) => handleChange("frequency_penalty", parseFloat(e.target.value) || 0)}
          aria-invalid={!!errors.frequency_penalty}
          aria-describedby={errors.frequency_penalty ? "frequency_penalty-error" : undefined}
          className={cn("font-mono", errors.frequency_penalty && "border-destructive")}
        />
        {errors.frequency_penalty && (
          <p id="frequency_penalty-error" className="text-xs text-destructive" role="alert">
            {errors.frequency_penalty}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          根据已有文本中的频率对新 Token 进行惩罚，降低模型重复相同内容的可能性
        </p>
      </div>

      {/* Presence Penalty */}
      <div className="space-y-2">
        <Label htmlFor="presence_penalty" className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            存在惩罚 (Presence Penalty)
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formData.presence_penalty.toFixed(2)}
          </span>
        </Label>
        <Input
          id="presence_penalty"
          type="number"
          step="0.01"
          min="-2"
          max="2"
          value={formData.presence_penalty}
          onChange={(e) => handleChange("presence_penalty", parseFloat(e.target.value) || 0)}
          aria-invalid={!!errors.presence_penalty}
          aria-describedby={errors.presence_penalty ? "presence_penalty-error" : undefined}
          className={cn("font-mono", errors.presence_penalty && "border-destructive")}
        />
        {errors.presence_penalty && (
          <p id="presence_penalty-error" className="text-xs text-destructive" role="alert">
            {errors.presence_penalty}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          根据 Token 是否出现在已有文本中进行惩罚，鼓励模型讨论新话题
        </p>
      </div>
    </SettingsSection>
  );
}
