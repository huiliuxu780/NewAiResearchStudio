"use client";

import { useEffect, useMemo, useState } from "react";
import { HTTPError } from "ky";
import { useAIModels, useTestAIModel, useUpdateAIModel } from "@/hooks";
import { AIModel } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  FileText,
  Globe,
  Info,
  Loader2,
  Maximize2,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Thermometer,
  TestTube,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDER_LABELS: Record<string, string> = {
  qwen: "通义千问",
  openai: "OpenAI",
  deepseek: "DeepSeek",
  custom: "自定义",
};

const PROVIDER_ICONS: Record<string, typeof Bot> = {
  qwen: Sparkles,
  openai: Globe,
  deepseek: Cpu,
  custom: Settings2,
};

const PROVIDER_COLORS: Record<string, string> = {
  qwen: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
  openai: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
  deepseek: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
  custom: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
};

const TASK_TYPE_LABELS: Record<string, string> = {
  fact_extraction: "事实抽取",
  insight_generation: "结论生成",
};

const TASK_TYPE_COLORS: Record<string, string> = {
  fact_extraction: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  insight_generation: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

type ActionStatus =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    const body = await error.response
      .json<{ detail?: string; error?: string }>()
      .catch(() => null);

    return body?.detail || body?.error || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function ModelsPage() {
  const [actionStatus, setActionStatus] = useState<ActionStatus>(null);
  const [busyModelId, setBusyModelId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    mutate,
  } = useAIModels();
  const updateMutation = useUpdateAIModel();
  const testMutation = useTestAIModel();

  const models = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => {
    if (!actionStatus) return undefined;

    const timer = window.setTimeout(() => setActionStatus(null), 5000);
    return () => window.clearTimeout(timer);
  }, [actionStatus]);

  const handleToggleDefault = async (model: AIModel) => {
    if (model.is_default) return;

    setBusyModelId(model.id);
    try {
      await updateMutation.trigger({
        id: model.id,
        data: { is_default: true },
      });
      await mutate();
      setActionStatus({
        type: "success",
        message: `已将 "${model.name}" 设为默认模型`,
      });
    } catch (mutationError) {
      setActionStatus({
        type: "error",
        message: await getErrorMessage(mutationError, "设为默认模型失败"),
      });
    } finally {
      setBusyModelId(null);
    }
  };

  const handleToggleEnabled = async (model: AIModel) => {
    setBusyModelId(model.id);
    try {
      await updateMutation.trigger({
        id: model.id,
        data: { enabled: !model.enabled },
      });
      await mutate();
      setActionStatus({
        type: "success",
        message: model.enabled
          ? `已停用 "${model.name}"`
          : `已启用 "${model.name}"`,
      });
    } catch (mutationError) {
      setActionStatus({
        type: "error",
        message: await getErrorMessage(
          mutationError,
          model.enabled ? "停用模型失败" : "启用模型失败",
        ),
      });
    } finally {
      setBusyModelId(null);
    }
  };

  const handleTest = async (model: AIModel) => {
    setBusyModelId(model.id);
    try {
      const result = await testMutation.trigger(model.id);
      setActionStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    } catch (mutationError) {
      setActionStatus({
        type: "error",
        message: await getErrorMessage(mutationError, "测试模型失败"),
      });
    } finally {
      setBusyModelId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Bot className="h-6 w-6 text-primary" />
            AI 模型管理
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            当前批次先收口真实列表、启停、设默认和模型测试，编辑与新增留到后续批次。
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          刷新列表
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">本轮范围</p>
            <p className="text-muted-foreground">
              已接入真实 API 的能力：列表、启用/停用、设为默认、测试模型。
            </p>
          </div>
        </div>
      </div>

      {actionStatus && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
            actionStatus.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : "border-destructive/20 bg-destructive/10 text-destructive",
          )}
          role="alert"
        >
          {actionStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{actionStatus.message}</span>
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 py-12 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <p className="text-lg font-medium text-destructive">模型列表加载失败</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">正在加载模型列表...</p>
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Bot className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground">暂无模型</p>
          <p className="mt-1 text-sm text-muted-foreground">
            当前环境里还没有 AI 模型记录，后续可在完整 CRUD 批次中补齐新增入口。
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {models.map((model) => {
            const ProviderIcon = PROVIDER_ICONS[model.provider] || Settings2;
            const providerColor = PROVIDER_COLORS[model.provider] || PROVIDER_COLORS.custom;
            const isBusy = busyModelId === model.id;

            return (
              <Card
                key={model.id}
                className={cn(
                  "group border-border/40 transition-all duration-300 hover:border-border/60 hover:shadow-xl hover:shadow-black/10",
                  model.is_default && "ring-1 ring-primary/20 bg-gradient-to-r from-primary/5 to-transparent",
                )}
              >
                <CardHeader className="px-5 pb-3 pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-xl border bg-gradient-to-br p-2.5",
                          providerColor,
                        )}
                      >
                        <ProviderIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{model.name}</CardTitle>
                          {model.is_default && (
                            <Badge
                              variant="default"
                              className="gap-1 border-primary/20 bg-primary/15 text-primary hover:bg-primary/25"
                            >
                              <Star className="h-3 w-3" />
                              默认
                            </Badge>
                          )}
                          {model.enabled ? (
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              已启用
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-muted/30 text-muted-foreground/60"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              已停用
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground/80">
                            {PROVIDER_LABELS[model.provider] || model.provider}
                          </span>
                          <span className="text-muted-foreground/50">/</span>
                          <code className="rounded bg-muted/50 px-1.5 py-0.5 text-xs font-mono">
                            {model.model_name}
                          </code>
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(model)}
                        disabled={isBusy}
                        className="h-8 gap-1.5 border-border/40 bg-background/40 text-xs transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                      >
                        {isBusy && testMutation.isMutating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <TestTube className="h-3.5 w-3.5" />
                        )}
                        测试
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                      <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                        <Thermometer className="h-3.5 w-3.5" />
                        <span className="text-xs">温度</span>
                      </div>
                      <p className="font-mono text-lg font-semibold">{model.temperature}</p>
                    </div>

                    <div className="rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                      <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="text-xs">最大 Token</span>
                      </div>
                      <p className="font-mono text-lg font-semibold">
                        {model.max_tokens.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                      <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs">任务类型</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {model.task_types.map((task) => (
                          <Badge
                            key={task}
                            variant="outline"
                            className={cn("text-xs", TASK_TYPE_COLORS[task] || "")}
                          >
                            {TASK_TYPE_LABELS[task] || task}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/30">
                      <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                        <Settings2 className="h-3.5 w-3.5" />
                        <span className="text-xs">快捷操作</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant={model.is_default ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleDefault(model)}
                          disabled={isBusy || model.is_default}
                          className={cn(
                            "h-7 w-full justify-start gap-1.5 border-border/40 bg-background/40 text-xs",
                            model.is_default && "border-primary/20 bg-primary/15 text-primary hover:bg-primary/25",
                          )}
                        >
                          {isBusy && updateMutation.isMutating && !model.is_default ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : model.is_default ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5" />
                          )}
                          设为默认
                        </Button>

                        <Button
                          variant={model.enabled ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => handleToggleEnabled(model)}
                          disabled={isBusy}
                          className={cn(
                            "h-7 w-full justify-start gap-1.5 border-border/40 bg-background/40 text-xs",
                            model.enabled
                              ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                              : "text-muted-foreground",
                          )}
                        >
                          {isBusy && updateMutation.isMutating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : model.enabled ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          {model.enabled ? "停用" : "启用"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {model.notes && (
                    <div className="mt-4 border-t border-border/30 pt-3">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{model.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
