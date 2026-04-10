"use client";

import { useState, useMemo } from "react";
import { Source } from "@/types";
import { mockSources } from "@/mock/sources";
import { SourceTable } from "@/components/sources/source-table";
import { SourceFilter } from "@/components/sources/source-filter";
import { SourceDetailSheet } from "@/components/sources/source-detail-sheet";
import { SourceFormDialog, SourceFormData } from "@/components/sources/source-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSources, useCreateSource, useUpdateSource, useDeleteSource } from "@/hooks";
import { useSWRConfig } from "swr";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export default function SourcesPage() {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    company: "all",
    type: "all",
    status: "all",
  });

  const { mutate } = useSWRConfig();
  const { data: apiData, isLoading } = useSources({
    company: filterValues.company !== "all" ? filterValues.company : undefined,
    type: filterValues.type !== "all" ? filterValues.type : undefined,
    is_active: filterValues.status !== "all" ? filterValues.status === "active" : undefined,
  });

  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource(editingSource?.id || "");
  const deleteMutation = useDeleteSource();

  const sources = useMemo(() => {
    if (USE_MOCK) {
      return mockSources.filter((source) => {
        if (filterValues.company !== "all" && source.company !== filterValues.company) {
          return false;
        }
        if (filterValues.type !== "all" && source.type !== filterValues.type) {
          return false;
        }
        if (filterValues.status !== "all") {
          const isActive = filterValues.status === "active";
          if (source.isActive !== isActive) {
            return false;
          }
        }
        return true;
      });
    }
    return apiData?.items || [];
  }, [apiData, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilterValues({ company: "all", type: "all", status: "all" });
  };

  const handleRowClick = (source: Source) => {
    setSelectedSource(source);
    setSheetOpen(true);
  };

  const handleToggleStatus = (source: Source) => {
    if (USE_MOCK) {
      console.log("Mock mode: toggle status for", source.id);
    } else {
      updateMutation.trigger({
        is_active: !source.isActive,
      }).then(() => {
        mutate(['sources']);
      });
    }
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
    if (USE_MOCK) {
      console.log("Mock mode: create/update source", data);
      setFormDialogOpen(false);
      return;
    }

    const apiData = {
      name: data.name,
      company: data.company,
      type: data.source_type,
      url: data.url,
      description: data.notes,
      is_active: data.enabled,
      schedule: data.schedule,
      parser_type: data.parser_type,
      priority: data.priority,
      notes: data.notes,
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
    if (USE_MOCK) {
      console.log("Mock mode: delete source", deletingSource?.id);
      setDeleteDialogOpen(false);
      return;
    }

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

      {isLoading && !USE_MOCK ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <SourceTable
          data={sources}
          onRowClick={handleRowClick}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
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
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isMutating}
      />
    </div>
  );
}