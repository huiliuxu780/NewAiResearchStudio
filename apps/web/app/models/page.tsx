"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, TestTube, CheckCircle2, XCircle, Cpu, Thermometer, Maximize2, Clock, FileText, Sparkles, Bot, Globe, Settings2, ArrowRight, Star, ShieldCheck, Zap, AlertTriangle, Info } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_name: string;
  api_base_url: string | null;
  temperature: number;
  max_tokens: number;
  enabled: boolean;
  is_default: boolean;
  task_types: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

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

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: "1",
      name: "Qwen-Plus",
      provider: "qwen",
      model_name: "qwen-plus",
      api_base_url: null,
      temperature: 0.1,
      max_tokens: 2000,
      enabled: true,
      is_default: true,
      task_types: ["fact_extraction", "insight_generation"],
      notes: "默认模型",
      created_at: "2026-04-10T00:00:00",
      updated_at: "2026-04-10T00:00:00",
    },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const handleDelete = (model: AIModel) => {
    setSelectedModel(model);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedModel) {
      setModels(models.filter((m) => m.id !== selectedModel.id));
      setDeleteDialogOpen(false);
      setSelectedModel(null);
    }
  };

  const handleTest = (model: AIModel) => {
    alert(`测试模型: ${model.name}\n(功能开发中)`);
  };

  const handleToggleDefault = (model: AIModel) => {
    setModels(
      models.map((m) => ({
        ...m,
        is_default: m.id === model.id,
      }))
    );
  };

  const handleToggleEnabled = (model: AIModel) => {
    setModels(
      models.map((m) =>
        m.id === model.id ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI 模型管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理 AI 模型配置，支持多模型切换和参数调整
          </p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          <Plus className="h-4 w-4" />
          添加模型
        </Button>
      </div>

      {/* 模型卡片列表 */}
      <div className="grid gap-4">
        {models.map((model) => {
          const ProviderIcon = PROVIDER_ICONS[model.provider] || Settings2;
          const providerColor = PROVIDER_COLORS[model.provider] || PROVIDER_COLORS.custom;

          return (
            <Card
              key={model.id}
              className={cn(
                "group border-border/40 transition-all duration-300 hover:border-border/60 hover:shadow-xl hover:shadow-black/10",
                model.is_default && "ring-1 ring-primary/20 bg-gradient-to-r from-primary/5 to-transparent"
              )}
            >
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* 提供商图标 */}
                    <div className={cn(
                      "flex-shrink-0 rounded-xl bg-gradient-to-br p-2.5 border",
                      providerColor
                    )}>
                      <ProviderIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{model.name}</CardTitle>
                        {model.is_default && (
                          <Badge variant="default" className="bg-primary/15 text-primary hover:bg-primary/25 border-primary/20 gap-1">
                            <Star className="h-3 w-3" />
                            默认
                          </Badge>
                        )}
                        {model.enabled ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            已启用
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground/60 bg-muted/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            已停用
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1.5 flex items-center gap-2 flex-wrap">
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

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(model)}
                      className="h-8 gap-1.5 text-xs border-border/40 bg-background/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <TestTube className="h-3.5 w-3.5" />
                      测试
                    </Button>
                    <Button variant="outline" size="icon-sm" className="h-8 w-8 border-border/40 bg-background/40 hover:bg-muted/50 transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => handleDelete(model)}
                      className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border/40 bg-background/40 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5">
                {/* 参数网格 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* 温度 */}
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                      <Thermometer className="h-3.5 w-3.5" />
                      <span className="text-xs">温度</span>
                    </div>
                    <p className="text-lg font-semibold font-mono">{model.temperature}</p>
                  </div>

                  {/* 最大 Token */}
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span className="text-xs">最大 Token</span>
                    </div>
                    <p className="text-lg font-semibold font-mono">{model.max_tokens.toLocaleString()}</p>
                  </div>

                  {/* 任务类型 */}
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
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

                  {/* 快捷操作 */}
                  <div className="rounded-lg bg-muted/20 p-3 border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                      <Settings2 className="h-3.5 w-3.5" />
                      <span className="text-xs">快捷操作</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button
                        variant={model.is_default ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleDefault(model)}
                        className={cn(
                          "h-7 text-xs gap-1.5 w-full justify-start border-border/40 bg-background/40",
                          model.is_default && "bg-primary/15 text-primary hover:bg-primary/25 border-primary/20"
                        )}
                      >
                        {model.is_default ? (
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
                        className={cn(
                          "h-7 text-xs gap-1.5 w-full justify-start border-border/40 bg-background/40",
                          model.enabled
                            ? "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                            : "text-muted-foreground"
                        )}
                      >
                        {model.enabled ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {model.enabled ? "停用" : "启用"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 备注 */}
                {model.notes && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{model.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除模型 "${selectedModel?.name}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        confirmText="删除"
        variant="destructive"
      />
    </div>
  );
}
