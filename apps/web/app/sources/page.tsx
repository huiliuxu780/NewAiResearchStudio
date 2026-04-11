"use client";

import { useState, useMemo } from "react";
import { Source } from "@/types/entities";
import { SourceTable } from "@/components/sources/source-table";
import { SourceFilter } from "@/components/sources/source-filter";
import { SourceDetailSheet } from "@/components/sources/source-detail-sheet";
import { SourceFormDialog, SourceFormData } from "@/components/sources/source-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSources, useCreateSource, useUpdateSource, useDeleteSource } from "@/hooks";
import { useSWRConfig } from "swr";
import { CreateSourceData, UpdateSourceData } from "@/lib/api/sources";

export default function SourcesPage() {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    company: "all",
    source_type: "all",
    enabled: "all",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { mutate } = useSWRConfig();
  const { data: apiData, isLoading, error } = useSources({
    company: filterValues.company !== "all" ? filterValues.company : undefined,
    source_type: filterValues.source_type !== "all" ? filterValues.source_type : undefined,
    enabled: filterValues.enabled !== "all" ? filterValues.enabled === "true" : undefined,
    page,
    page_size: pageSize,
  });

  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource(editingSource?.id || "");
  const deleteMutation = useDeleteSource();

  const sources = useMemo(() => {
    return apiData?.items || [];
  }, [apiData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleFilterReset = () => {
    setFilterValues({ company: "all", source_type: "all", enabled: "all" });
    setPage(1);
  };

  const handleRowClick = (source: Source) => {
    setSelectedSource(source);
    setSheetOpen(true);
  };

  const handleToggleStatus = async (source: Source) => {
    await updateMutation.trigger({ enabled: !source.enabled });
    mutate(['sources']);
  };

  const handleCreateClick = () => {
    setEditingSource(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (source: Source) => {
    setEditingSource(source);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (source: Source) => {
    setDeletingSource(source);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: SourceFormData) => {
    const apiData: CreateSourceData & UpdateSourceData = {
      name: data.name,
      company: data.company,
      source_type: data.source_type,
      url: data.url,
      notes: data.notes,
      enabled: data.enabled,
      schedule: data.schedule,
      parser_type: data.parser_type,
      priority: data.priority,
      // 采集策略相关字段
      crawl_strategy: data.crawl_strategy,
      crawl_config: data.crawl_config,
      social_platform: data.social_platform || null,
      social_account_id: data.social_account_id || null,
    };

    try {
      if (editingSource) {
        await updateMutation.trigger(apiData);
      } else {
        await createMutation.trigger(apiData);
      }
      setFormDialogOpen(false);
      mutate(['sources']);
    } catch (error) {
      console.error("Failed to save source:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingSource) {
      try {
        await deleteMutation.trigger(deletingSource.id);
        setDeleteDialogOpen(false);
        mutate(['sources']);
      } catch (error) {
        console.error("Failed to delete source:", error);
      }
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">信息源管理</h1>
        <div className="text-center py-8 text-destructive">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">信息源管理</h1>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          新增信息源
        </Button>
      </div>

      <SourceFilter
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <SourceTable
          data={sources}
          onRowClick={handleRowClick}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          pagination={{
            page,
            pageSize,
            total: apiData?.total ?? 0,
            totalPages: apiData?.total_pages ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
          }}
        />
      )}

      <SourceDetailSheet
        source={selectedSource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <SourceFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        initialData={editingSource}
        onSubmit={handleFormSubmit}
        loading={createMutation.isMutating || updateMutation.isMutating}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="删除信息源"
        description={`确定要删除信息源 "${deletingSource?.name}" 吗？此操作不可撤销。`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}