"use client";

import { useState, useMemo, useCallback } from "react";
import { PromptTemplate } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PromptTemplateCard } from "@/components/prompts/prompt-template-card";
import { PromptTemplateSheet } from "@/components/prompts/prompt-template-sheet";
import { PromptTemplateTestDialog } from "@/components/prompts/prompt-template-test-dialog";
import {
  usePromptTemplates,
  useCreatePromptTemplate,
  useUpdatePromptTemplate,
  useDeletePromptTemplate,
  useTestPromptTemplate,
} from "@/hooks";
import { useSWRConfig } from "swr";
import { Plus, Loader2 } from "lucide-react";

const filterConfig: FilterConfig[] = [
  {
    key: "category",
    type: "select",
    label: "分类",
    options: [
      { value: "fact_extraction", label: "事实提取" },
      { value: "insight_generation", label: "洞察生成" },
      { value: "summary", label: "摘要" },
      { value: "classification", label: "分类" },
      { value: "other", label: "其他" },
    ],
  },
  {
    key: "task_type",
    type: "select",
    label: "任务类型",
    options: [
      { value: "extraction", label: "提取" },
      { value: "generation", label: "生成" },
      { value: "analysis", label: "分析" },
      { value: "transformation", label: "转换" },
      { value: "other", label: "其他" },
    ],
  },
  {
    key: "is_active",
    type: "select",
    label: "状态",
    options: [
      { value: "true", label: "已启用" },
      { value: "false", label: "已停用" },
    ],
  },
];

export default function PromptsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null);
  const [testTarget, setTestTarget] = useState<PromptTemplate | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; template_name: string; variables: string[] } | null>(null);

  const { mutate } = useSWRConfig();

  const apiFilters = useMemo(() => {
    const f: Record<string, string | boolean | undefined> = {};
    if (filters.category && filters.category !== "all") f.category = filters.category;
    if (filters.task_type && filters.task_type !== "all") f.task_type = filters.task_type;
    if (filters.is_active && filters.is_active !== "all") f.is_active = filters.is_active === "true";
    return f;
  }, [filters]);

  const { data: apiData, isLoading, error } = usePromptTemplates(apiFilters as any);
  const { trigger: triggerCreate, isMutating: isCreating } = useCreatePromptTemplate();
  const { trigger: triggerUpdate, isMutating: isUpdating } = useUpdatePromptTemplate();
  const { trigger: triggerDelete, isMutating: isDeleting } = useDeletePromptTemplate();
  const { trigger: triggerTest, isMutating: isTesting } = useTestPromptTemplate();

  const templates = useMemo(() => apiData?.items || [], [apiData]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleNewTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setIsNewTemplate(true);
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template);
    setIsNewTemplate(false);
    setSheetOpen(true);
  }, []);

  const handleTest = useCallback((template: PromptTemplate) => {
    setTestTarget(template);
    setTestResult(null);
  }, []);

  const handleToggleActive = useCallback(async (template: PromptTemplate) => {
    await triggerUpdate({
      id: template.id,
      data: { is_active: !template.is_active },
    });
    mutate(["prompt-templates", apiFilters]);
  }, [triggerUpdate, mutate, apiFilters]);

  const handleDelete = useCallback((template: PromptTemplate) => {
    setDeleteTarget(template);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      await triggerDelete(deleteTarget.id);
      mutate(["prompt-templates", apiFilters]);
      setDeleteTarget(null);
    }
  }, [deleteTarget, triggerDelete, mutate, apiFilters]);

  const handleSaveTemplate = useCallback(async (data: Partial<PromptTemplate>) => {
    if (isNewTemplate) {
      await triggerCreate(data as any);
    } else if (selectedTemplate) {
      await triggerUpdate({
        id: selectedTemplate.id,
        data: data as any,
      });
    }
    mutate(["prompt-templates", apiFilters]);
    setSheetOpen(false);
  }, [isNewTemplate, selectedTemplate, triggerCreate, triggerUpdate, mutate, apiFilters]);

  const handleRunTest = useCallback(async (id: string, _variables: Record<string, string>) => {
    const result = await triggerTest(id);
    setTestResult(result);
  }, [triggerTest]);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">提示词管理</h1>
        <div className="text-center py-8 text-destructive">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">提示词管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理和测试 AI 提示词模板
          </p>
        </div>
        <Button onClick={handleNewTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          新建提示词
        </Button>
      </div>

      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          加载中...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">暂无提示词模板</p>
          <p className="text-sm">点击"新建提示词"创建第一个提示词模板</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <PromptTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onTest={handleTest}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PromptTemplateSheet
        template={selectedTemplate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSaveTemplate}
        isSaving={isCreating || isUpdating}
      />

      <PromptTemplateTestDialog
        template={testTarget}
        open={!!testTarget}
        onOpenChange={(open) => {
          if (!open) {
            setTestTarget(null);
            setTestResult(null);
          }
        }}
        onTest={handleRunTest}
        isTesting={isTesting}
        testResult={testResult}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="删除提示词"
        description={`确定要删除提示词"${deleteTarget?.name}"吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
