"use client";

import { useState, useMemo } from "react";
import { CrawlTask } from "@/types/crawl-tasks";
import { CrawlTaskCard } from "@/components/crawl-tasks/crawl-task-card";
import { CrawlTaskStatsCard } from "@/components/crawl-tasks/crawl-task-stats";
import { CrawlTaskCreateDialog, CreateTaskFormData } from "@/components/crawl-tasks/crawl-task-create-dialog";
import { CrawlTaskDetailSheet } from "@/components/crawl-tasks/crawl-task-detail-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertTriangle, Inbox } from "lucide-react";
import {
  useCrawlTasks,
  useCreateCrawlTask,
  useCancelCrawlTask,
  useCrawlTaskStats,
} from "@/hooks";
import { useSources } from "@/hooks";
import { useSWRConfig } from "swr";

const statusOptions = [
  { value: "pending", label: "等待中" },
  { value: "running", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "failed", label: "失败" },
  { value: "cancelled", label: "已取消" },
];

const taskTypeOptions = [
  { value: "full", label: "全量抓取" },
  { value: "incremental", label: "增量抓取" },
  { value: "retry", label: "重试抓取" },
];

const filterConfig: FilterConfig[] = [
  {
    key: "status",
    type: "select",
    label: "状态",
    options: statusOptions,
  },
  {
    key: "task_type",
    type: "select",
    label: "任务类型",
    options: taskTypeOptions,
  },
  {
    key: "date_from",
    type: "date",
    label: "开始日期",
  },
  {
    key: "date_to",
    type: "date",
    label: "结束日期",
  },
];

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<CrawlTask | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelingTask, setCancelingTask] = useState<CrawlTask | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "all",
    task_type: "all",
    date_from: "",
    date_to: "",
  });

  const { mutate } = useSWRConfig();

  // 获取任务列表
  const { data: apiData, isLoading, error } = useCrawlTasks({
    status: filterValues.status !== "all" ? filterValues.status : undefined,
    task_type: filterValues.task_type !== "all" ? filterValues.task_type : undefined,
    date_from: filterValues.date_from || undefined,
    date_to: filterValues.date_to || undefined,
  });

  // 获取统计数据
  const { data: statsData, isLoading: statsLoading } = useCrawlTaskStats();

  // 获取数据源列表（用于创建任务对话框）
  const { data: sourcesData, isLoading: sourcesLoading } = useSources();

  // 创建/取消 mutation
  const createMutation = useCreateCrawlTask();
  const cancelMutation = useCancelCrawlTask();

  const tasks = useMemo(() => {
    return apiData?.items || [];
  }, [apiData]);

  const sources = useMemo(() => {
    return sourcesData?.items || [];
  }, [sourcesData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilterValues({
      status: "all",
      task_type: "all",
      date_from: "",
      date_to: "",
    });
  };

  const handleViewDetail = (task: CrawlTask) => {
    setSelectedTask(task);
    setDetailSheetOpen(true);
  };

  const handleCancelClick = (task: CrawlTask) => {
    setCancelingTask(task);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (cancelingTask) {
      try {
        await cancelMutation.trigger(cancelingTask.id);
        setCancelDialogOpen(false);
        mutate(["crawl-tasks"]);
        mutate("crawl-tasks-stats");
      } catch (error) {
        console.error("Failed to cancel task:", error);
      }
    }
  };

  const handleCreateSubmit = async (data: CreateTaskFormData) => {
    try {
      await createMutation.trigger(data);
      setCreateDialogOpen(false);
      mutate(["crawl-tasks"]);
      mutate("crawl-tasks-stats");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">抓取任务管理</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 py-12 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <p className="text-lg font-medium text-destructive">加载失败</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => mutate(["crawl-tasks"])}
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">抓取任务管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理和监控数据抓取任务的执行状态
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          新建任务
        </Button>
      </div>

      {/* 统计区域 */}
      <CrawlTaskStatsCard stats={statsData} isLoading={statsLoading} />

      {/* 筛选器 */}
      <FilterBar
        filters={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* 任务列表 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">加载任务列表...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <Inbox className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground">暂无任务</p>
          <p className="mt-1 text-sm text-muted-foreground">
            点击「新建任务」按钮创建第一个抓取任务
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            新建任务
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <CrawlTaskCard
              key={task.id}
              task={task}
              onViewDetail={handleViewDetail}
              onCancel={handleCancelClick}
            />
          ))}
        </div>
      )}

      {/* 创建任务对话框 */}
      <CrawlTaskCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        sources={sources}
        isLoadingSources={sourcesLoading}
        onSubmit={handleCreateSubmit}
        loading={createMutation.isMutating}
      />

      {/* 任务详情侧边栏 */}
      <CrawlTaskDetailSheet
        task={selectedTask}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      {/* 取消确认对话框 */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="取消任务"
        description={`确定要取消任务 "${cancelingTask?.id.slice(0, 8)}..." 吗？此操作不可撤销。`}
        confirmText="确认取消"
        cancelText="返回"
        variant="destructive"
        onConfirm={handleCancelConfirm}
        loading={cancelMutation.isMutating}
      />
    </div>
  );
}
