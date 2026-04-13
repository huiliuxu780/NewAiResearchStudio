"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useSWRConfig } from "swr";
import { PushChannelEditorSheet } from "@/components/push/push-channel-editor-sheet";
import { PushChannelSheet } from "@/components/push/push-channel-sheet";
import { PushAnalyticsPanel } from "@/components/push/push-analytics-panel";
import { PushChannelsTab } from "@/components/push/push-channels-tab";
import { PushFlashBanner, type PushFlashMessage } from "@/components/push/push-flash-banner";
import { PushMetricHints } from "@/components/push/push-metric-hints";
import { PushRecordSheet } from "@/components/push/push-record-sheet";
import { PushRiskRadar } from "@/components/push/push-risk-radar";
import { formatJson } from "@/components/push/push-shared";
import { PushStatsCards } from "@/components/push/push-stats";
import { PushTaskEditorSheet } from "@/components/push/push-task-editor-sheet";
import { PushTaskTriggerSheet } from "@/components/push/push-task-trigger-sheet";
import { PushTaskSheet } from "@/components/push/push-task-sheet";
import { PushTemplateSheet } from "@/components/push/push-template-sheet";
import { PushTemplateEditorSheet } from "@/components/push/push-template-editor-sheet";
import { PushTemplatesTab } from "@/components/push/push-templates-tab";
import { PushRecordsTab } from "@/components/push/push-records-tab";
import { PushTasksTab } from "@/components/push/push-tasks-tab";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PushRecordDiagnosticFilter, PushTaskRiskFilter } from "@/lib/push-console-utils";
import {
  useCreatePushTask,
  useDisablePushTask,
  useDeletePushTask,
  useEnablePushTask,
  usePreviewPushTemplate,
  usePushChannels,
  usePushRecords,
  usePushStats,
  usePushTasks,
  usePushTemplates,
  useCreatePushTemplate,
  useCreatePushChannel,
  useDeletePushChannel,
  useDeletePushTemplate,
  useRetryPushRecord,
  useTriggerPushEvent,
  useTriggerPushTask,
  useUpdatePushTask,
  useUpdatePushTemplate,
  useUpdatePushChannel,
} from "@/hooks/use-push";
import { buildChannelDependencyMessage, buildTemplateDependencyMessage, getRetryableRecords } from "@/lib/push-console-utils";
import type {
  PushChannel,
  PushChannelCreateData,
  PushChannelsFilter,
  PushChannelUpdateData,
  PushRecord,
  PushRecordsFilter,
  PushTask,
  PushTaskCreateData,
  PushTasksFilter,
  PushTaskUpdateData,
  PushTemplate,
  PushTemplateCreateData,
  PushTemplatePreview,
  PushTemplateUpdateData,
  PushTemplatesFilter,
  TriggerPushEventData,
  TriggerPushTaskData,
} from "@/types/push";

export default function PushPage() {
  const { mutate } = useSWRConfig();
  const [activeTab, setActiveTab] = useState("channels");
  const [focusMode, setFocusMode] = useState<"none" | "task-risk" | "channel-risk" | "template-risk" | "record-risk">("none");
  const [flashMessage, setFlashMessage] = useState<PushFlashMessage | null>(null);

  const [channelTypeFilter, setChannelTypeFilter] = useState("all");
  const [channelEnabledFilter, setChannelEnabledFilter] = useState("all");
  const [channelPage, setChannelPage] = useState(1);
  const [channelPageSize, setChannelPageSize] = useState(10);

  const [taskTriggerFilter, setTaskTriggerFilter] = useState("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskEnabledFilter, setTaskEnabledFilter] = useState("all");
  const [taskRiskFilter, setTaskRiskFilter] = useState<PushTaskRiskFilter>("all");
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);

  const [recordStatusFilter, setRecordStatusFilter] = useState("all");
  const [recordChannelFilter, setRecordChannelFilter] = useState("all");
  const [recordChannelIdFilter, setRecordChannelIdFilter] = useState("all");
  const [recordDiagnosticFilter, setRecordDiagnosticFilter] = useState<PushRecordDiagnosticFilter>("all");
  const [recordTaskFocus, setRecordTaskFocus] = useState<{ id: string; name: string } | null>(null);
  const [recordPage, setRecordPage] = useState(1);
  const [recordPageSize, setRecordPageSize] = useState(10);

  const [templateEnabledFilter, setTemplateEnabledFilter] = useState("all");
  const [templatePage, setTemplatePage] = useState(1);
  const [templatePageSize, setTemplatePageSize] = useState(10);

  const [selectedChannel, setSelectedChannel] = useState<PushChannel | null>(null);
  const [editingChannel, setEditingChannel] = useState<PushChannel | null>(null);
  const [channelDraftSource, setChannelDraftSource] = useState<PushChannel | null>(null);
  const [channelEditorOpen, setChannelEditorOpen] = useState(false);
  const [deletingChannel, setDeletingChannel] = useState<PushChannel | null>(null);
  const [selectedTask, setSelectedTask] = useState<PushTask | null>(null);
  const [editingTask, setEditingTask] = useState<PushTask | null>(null);
  const [taskDraftSource, setTaskDraftSource] = useState<PushTask | null>(null);
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<PushTask | null>(null);
  const [triggerTaskDraft, setTriggerTaskDraft] = useState<PushTask | null>(null);
  const [taskTriggerSheetOpen, setTaskTriggerSheetOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PushRecord | null>(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [detailTemplate, setDetailTemplate] = useState<PushTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PushTemplate | null>(null);
  const [templateDraftSource, setTemplateDraftSource] = useState<PushTemplate | null>(null);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<PushTemplate | null>(null);
  const [channelDisableConfirmation, setChannelDisableConfirmation] = useState<{
    channel: PushChannel;
    mode: "toggle" | "save";
    data?: PushChannelUpdateData;
  } | null>(null);
  const [templateDisableConfirmation, setTemplateDisableConfirmation] = useState<{
    template: PushTemplate;
    data: PushTemplateUpdateData;
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PushTemplate | null>(null);
  const [previewVariablesText, setPreviewVariablesText] = useState("{}");
  const [previewResult, setPreviewResult] = useState<PushTemplatePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [autoPreviewedTemplateId, setAutoPreviewedTemplateId] = useState<string | null>(null);

  const [togglingChannelId, setTogglingChannelId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [triggeringTaskId, setTriggeringTaskId] = useState<string | null>(null);
  const [retryingRecordId, setRetryingRecordId] = useState<string | null>(null);
  const [batchRetryingRecords, setBatchRetryingRecords] = useState(false);
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);

  const channelQuery = useMemo<PushChannelsFilter>(
    () => ({
      channel_type: channelTypeFilter !== "all" ? channelTypeFilter : undefined,
      is_enabled: channelEnabledFilter !== "all" ? channelEnabledFilter === "true" : undefined,
      page: channelPage,
      page_size: channelPageSize,
    }),
    [channelEnabledFilter, channelPage, channelPageSize, channelTypeFilter]
  );

  const taskQuery = useMemo<PushTasksFilter>(
    () => ({
      trigger_type: taskTriggerFilter !== "all" ? taskTriggerFilter : undefined,
      status: taskStatusFilter !== "all" ? taskStatusFilter : undefined,
      is_enabled: taskEnabledFilter !== "all" ? taskEnabledFilter === "true" : undefined,
      page: taskPage,
      page_size: taskPageSize,
    }),
    [taskEnabledFilter, taskPage, taskPageSize, taskStatusFilter, taskTriggerFilter]
  );

  const recordQuery = useMemo<PushRecordsFilter>(
    () => ({
      task_id: recordTaskFocus?.id,
      channel_id: recordChannelIdFilter !== "all" ? recordChannelIdFilter : undefined,
      status: recordStatusFilter !== "all" ? recordStatusFilter : undefined,
      channel_type: recordChannelFilter !== "all" ? recordChannelFilter : undefined,
      page: recordPage,
      page_size: recordPageSize,
    }),
    [recordChannelFilter, recordChannelIdFilter, recordPage, recordPageSize, recordStatusFilter, recordTaskFocus?.id]
  );

  const templateQuery = useMemo<PushTemplatesFilter>(
    () => ({
      is_enabled: templateEnabledFilter !== "all" ? templateEnabledFilter === "true" : undefined,
      page: templatePage,
      page_size: templatePageSize,
    }),
    [templateEnabledFilter, templatePage, templatePageSize]
  );

  const stats = usePushStats(30);
  const channels = usePushChannels(channelQuery);
  const tasks = usePushTasks(taskQuery);
  const records = usePushRecords(recordQuery);
  const templates = usePushTemplates(templateQuery);
  const taskEditorChannels = usePushChannels({ page: 1, page_size: 100 });
  const recordFilterTasks = usePushTasks({ page: 1, page_size: 100 });
  const recordFilterChannels = usePushChannels({
    page: 1,
    page_size: 100,
    channel_type: recordChannelFilter !== "all" ? recordChannelFilter : undefined,
  });
  const taskEditorTemplates = usePushTemplates({ page: 1, page_size: 100 });
  const dependencyTasks = useMemo(() => recordFilterTasks.data?.items ?? [], [recordFilterTasks.data?.items]);
  const currentRecordItems = useMemo(() => records.data?.items ?? [], [records.data?.items]);
  const selectedRetryableRecords = useMemo(
    () => getRetryableRecords(currentRecordItems).filter((record) => selectedRecordIds.includes(record.id)),
    [currentRecordItems, selectedRecordIds]
  );
  const selectedRetryableTaskIds = useMemo(
    () => [...new Set(selectedRetryableRecords.map((record) => record.task_id))],
    [selectedRetryableRecords]
  );
  const selectedRetryableTaskName = useMemo(() => {
    if (selectedRetryableTaskIds.length !== 1) {
      return null;
    }

    return dependencyTasks.find((task) => task.id === selectedRetryableTaskIds[0])?.name ?? null;
  }, [dependencyTasks, selectedRetryableTaskIds]);

  const updateChannelMutation = useUpdatePushChannel();
  const createChannelMutation = useCreatePushChannel();
  const deleteChannelMutation = useDeletePushChannel();
  const createTaskMutation = useCreatePushTask();
  const updateTaskMutation = useUpdatePushTask();
  const deleteTaskMutation = useDeletePushTask();
  const enableTaskMutation = useEnablePushTask();
  const disableTaskMutation = useDisablePushTask();
  const triggerTaskMutation = useTriggerPushTask();
  const triggerEventMutation = useTriggerPushEvent();
  const retryRecordMutation = useRetryPushRecord();
  const previewTemplateMutation = usePreviewPushTemplate();
  const createTemplateMutation = useCreatePushTemplate();
  const updateTemplateMutation = useUpdatePushTemplate();
  const deleteTemplateMutation = useDeletePushTemplate();

  useEffect(() => {
    if (templates.data?.items.length && !selectedTemplate) {
      const initialTemplate = templates.data.items[0];
      setSelectedTemplate(initialTemplate);
      setPreviewVariablesText(formatJson(initialTemplate.default_values ?? {}));
    }
  }, [selectedTemplate, templates.data?.items]);

  useEffect(() => {
    if (!selectedTemplate || autoPreviewedTemplateId === selectedTemplate.id) {
      return;
    }

    const template = selectedTemplate;
    const nextVariablesText = formatJson(template.default_values ?? {});
    let cancelled = false;

    async function previewInitialTemplate() {
      setPreviewingTemplateId(template.id);
      setPreviewError(null);

      try {
        const result = await previewTemplateMutation.trigger({
          id: template.id,
          data: { variables: parseVariablesJson(nextVariablesText) },
        });

        if (!cancelled) {
          setPreviewResult(result);
          setAutoPreviewedTemplateId(template.id);
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewResult(null);
          setPreviewError(getErrorMessage(error, "模板预览失败，请检查变量 JSON 是否正确。"));
          setAutoPreviewedTemplateId(template.id);
        }
      } finally {
        if (!cancelled) {
          setPreviewingTemplateId(null);
        }
      }
    }

    void previewInitialTemplate();

    return () => {
      cancelled = true;
    };
  }, [autoPreviewedTemplateId, previewTemplateMutation, selectedTemplate]);

  useEffect(() => {
    if (recordChannelIdFilter === "all") {
      return;
    }

    const channelExists = (recordFilterChannels.data?.items ?? []).some((channel) => channel.id === recordChannelIdFilter);

    if (!channelExists) {
      setRecordChannelIdFilter("all");
    }
  }, [recordChannelIdFilter, recordFilterChannels.data?.items]);

  useEffect(() => {
    const recordIds = new Set(currentRecordItems.map((record) => record.id));
    setSelectedRecordIds((current) => current.filter((id) => recordIds.has(id)));
  }, [currentRecordItems]);

  async function refreshPushData() {
    await Promise.all([
      mutate(["push-stats", 30]),
      mutate(["push-channels", channelQuery]),
      mutate(["push-tasks", taskQuery]),
      mutate(["push-records", recordQuery]),
      mutate(["push-templates", templateQuery]),
      mutate(["push-channels", { page: 1, page_size: 100 }]),
      mutate(["push-tasks", { page: 1, page_size: 100 }]),
      mutate([
        "push-channels",
        {
          page: 1,
          page_size: 100,
          channel_type: recordChannelFilter !== "all" ? recordChannelFilter : undefined,
        },
      ]),
      mutate(["push-templates", { page: 1, page_size: 100 }]),
    ]);
  }

  async function performToggleChannel(channel: PushChannel, nextEnabled: boolean) {
    setFlashMessage(null);
    setTogglingChannelId(channel.id);

    try {
      await updateChannelMutation.trigger({
        id: channel.id,
        data: { is_enabled: nextEnabled },
      });

      await refreshPushData();
      setFlashMessage({
        tone: "success",
        text: `${channel.name} 已${nextEnabled ? "启用" : "停用"}。`,
      });
    } catch (error) {
      setFlashMessage({
        tone: "error",
        text: getErrorMessage(error, `更新渠道「${channel.name}」失败。`),
      });
    } finally {
      setTogglingChannelId(null);
    }
  }

  async function handleToggleChannel(channel: PushChannel) {
    if (channel.is_enabled) {
      setChannelDisableConfirmation({
        channel,
        mode: "toggle",
      });
      return;
    }

    await performToggleChannel(channel, true);
  }

  async function persistChannel(data: PushChannelCreateData | PushChannelUpdateData) {
    setFlashMessage(null);

    try {
      if (editingChannel) {
        const updated = await updateChannelMutation.trigger({
          id: editingChannel.id,
          data: data as PushChannelUpdateData,
        });
        setSelectedChannel(updated);
        setFlashMessage({ tone: "success", text: `渠道「${updated.name}」已更新。` });
      } else {
        const created = await createChannelMutation.trigger(data as PushChannelCreateData);
        setSelectedChannel(created);
        setFlashMessage({ tone: "success", text: `渠道「${created.name}」已创建。` });
      }

      await refreshPushData();
      setChannelEditorOpen(false);
      setEditingChannel(null);
      setChannelDraftSource(null);
    } catch (error) {
      setFlashMessage({ tone: "error", text: getErrorMessage(error, "保存推送渠道失败。") });
    }
  }

  async function handleSaveChannel(data: PushChannelCreateData | PushChannelUpdateData) {
    if (editingChannel && editingChannel.is_enabled && "is_enabled" in data && data.is_enabled === false) {
      setChannelDisableConfirmation({
        channel: editingChannel,
        mode: "save",
        data,
      });
      return;
    }

    await persistChannel(data);
  }

  async function handleConfirmChannelDisable() {
    if (!channelDisableConfirmation) return;

    const { channel, mode, data } = channelDisableConfirmation;
    setChannelDisableConfirmation(null);

    if (mode === "toggle") {
      await performToggleChannel(channel, false);
      return;
    }

    if (data) {
      await persistChannel(data);
    }
  }

  async function handleDeleteChannel() {
    if (!deletingChannel) return;

    setFlashMessage(null);

    try {
      await deleteChannelMutation.trigger(deletingChannel.id);
      await refreshPushData();

      if (selectedChannel?.id === deletingChannel.id) {
        setSelectedChannel(null);
      }

      setFlashMessage({ tone: "success", text: `渠道「${deletingChannel.name}」已删除。` });
      setDeletingChannel(null);
    } catch (error) {
      setFlashMessage({ tone: "error", text: getErrorMessage(error, "删除推送渠道失败。") });
    }
  }

  async function handleToggleTask(task: PushTask) {
    setFlashMessage(null);
    setUpdatingTaskId(task.id);

    try {
      if (task.is_enabled) {
        await disableTaskMutation.trigger(task.id);
      } else {
        await enableTaskMutation.trigger(task.id);
      }

      await refreshPushData();
      setFlashMessage({
        tone: "success",
        text: `${task.name} 已${task.is_enabled ? "停用" : "启用"}。`,
      });
    } catch (error) {
      setFlashMessage({
        tone: "error",
        text: getErrorMessage(error, `更新任务「${task.name}」失败。`),
      });
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleSaveTask(data: PushTaskCreateData | PushTaskUpdateData) {
    setFlashMessage(null);

    try {
      if (editingTask) {
        const updated = await updateTaskMutation.trigger({
          id: editingTask.id,
          data: data as PushTaskUpdateData,
        });
        setSelectedTask(updated);
        setFlashMessage({ tone: "success", text: `任务「${updated.name}」已更新。` });
      } else {
        const created = await createTaskMutation.trigger(data as PushTaskCreateData);
        setSelectedTask(created);
        setFlashMessage({ tone: "success", text: `任务「${created.name}」已创建。` });
      }

      await refreshPushData();
      setTaskEditorOpen(false);
      setEditingTask(null);
      setTaskDraftSource(null);
    } catch (error) {
      setFlashMessage({ tone: "error", text: getErrorMessage(error, "保存推送任务失败。") });
    }
  }

  async function handleDeleteTask() {
    if (!deletingTask) return;

    setFlashMessage(null);

    try {
      await deleteTaskMutation.trigger(deletingTask.id);
      await refreshPushData();

      if (selectedTask?.id === deletingTask.id) {
        setSelectedTask(null);
      }
      if (recordTaskFocus?.id === deletingTask.id) {
        setRecordTaskFocus(null);
      }

      setFlashMessage({ tone: "success", text: `任务「${deletingTask.name}」已删除。` });
      setDeletingTask(null);
    } catch (error) {
      setFlashMessage({ tone: "error", text: getErrorMessage(error, "删除推送任务失败。") });
    }
  }

  function handleInspectTaskRecords(task: PushTask) {
    setFocusMode("none");
    setRecordTaskFocus({ id: task.id, name: task.name });
    setRecordDiagnosticFilter("all");
    setRecordChannelFilter("all");
    setRecordChannelIdFilter("all");
    setRecordPage(1);
    setActiveTab("records");
  }

  function handleInspectChannelRecords(channel: PushChannel) {
    setFocusMode("none");
    setRecordTaskFocus(null);
    setRecordDiagnosticFilter("all");
    setRecordStatusFilter("all");
    setRecordChannelFilter(channel.channel_type);
    setRecordChannelIdFilter(channel.id);
    setRecordPage(1);
    setRecordPageSize(100);
    setActiveTab("records");
  }

  async function handleTriggerTask(task: PushTask) {
    setTriggerTaskDraft(task);
    setTaskTriggerSheetOpen(true);
  }

  async function handleSubmitTaskTrigger(task: PushTask, data: TriggerPushTaskData) {
    setFlashMessage(null);
    setTriggeringTaskId(task.id);

    try {
      const result =
        task.trigger_type === "event_triggered" && task.event_type
          ? await triggerEventMutation.trigger({
              event_type: task.event_type,
              event_data: data.template_variables ?? {},
            } satisfies TriggerPushEventData)
          : await triggerTaskMutation.trigger({ id: task.id, data });

      const distinctTaskIds = [...new Set(result.map((record) => record.task_id))];
      const nextFocus =
        distinctTaskIds.length === 1
          ? {
              id: distinctTaskIds[0],
              name:
                distinctTaskIds[0] === task.id
                  ? task.name
                  : tasks.data?.items.find((item) => item.id === distinctTaskIds[0])?.name ?? task.name,
            }
          : null;
      const nextRecordQuery = {
        ...recordQuery,
        task_id: nextFocus?.id,
        page: 1,
      };

      await Promise.all([
        mutate(["push-stats", 30]),
        mutate(["push-channels", channelQuery]),
        mutate(["push-tasks", taskQuery]),
        mutate(["push-records", nextRecordQuery]),
        mutate(["push-templates", templateQuery]),
      ]);

      setRecordTaskFocus(nextFocus);
      setRecordPage(1);
      setFlashMessage({
        tone: "success",
        text:
          task.trigger_type === "event_triggered" && task.event_type
            ? `事件「${task.event_type}」已触发，生成 ${result.length} 条推送记录。`
            : `任务「${task.name}」已手动触发，生成 ${result.length} 条推送记录。`,
      });
      setTaskTriggerSheetOpen(false);
      setTriggerTaskDraft(null);
      setActiveTab("records");
    } catch (error) {
      setFlashMessage({
        tone: "error",
        text: getErrorMessage(error, `触发任务「${task.name}」失败。`),
      });
    } finally {
      setTriggeringTaskId(null);
    }
  }

  async function handleRetryRecord(record: PushRecord) {
    setFlashMessage(null);
    setRetryingRecordId(record.id);

    try {
      await retryRecordMutation.trigger({ id: record.id });
      await refreshPushData();
      setFlashMessage({
        tone: "success",
        text: `记录「${record.title}」已重新进入重试流程。`,
      });
    } catch (error) {
      setFlashMessage({
        tone: "error",
        text: getErrorMessage(error, `重试记录「${record.title}」失败。`),
      });
    } finally {
      setRetryingRecordId(null);
    }
  }

  async function handleBatchRetryRecords() {
    if (!selectedRetryableRecords.length) return;

    setFlashMessage(null);
    setBatchRetryingRecords(true);

    try {
      for (const record of selectedRetryableRecords) {
        await retryRecordMutation.trigger({ id: record.id });
      }

      await refreshPushData();
      setSelectedRecordIds([]);
      setFlashMessage({
        tone: "success",
        text: `已将 ${selectedRetryableRecords.length} 条失败记录重新送入重试流程。`,
      });
    } catch (error) {
      setFlashMessage({
        tone: "error",
        text: getErrorMessage(error, "批量重试失败，请稍后再试。"),
      });
    } finally {
      setBatchRetryingRecords(false);
    }
  }

  function handleFocusSelectedRecordTask() {
    if (selectedRetryableTaskIds.length !== 1) return;

    const taskId = selectedRetryableTaskIds[0];
    const taskName = selectedRetryableTaskName ?? dependencyTasks.find((task) => task.id === taskId)?.name ?? "关联任务";
    setRecordTaskFocus({ id: taskId, name: taskName });
    setRecordPage(1);
  }

  function handleInspectRecordTask(record: PushRecord) {
    setFocusMode("none");
    const linkedTask = dependencyTasks.find((task) => task.id === record.task_id);
    setSelectedRecord(null);
    setRecordDiagnosticFilter("all");
    setRecordChannelFilter("all");
    setRecordChannelIdFilter("all");
    setRecordTaskFocus({
      id: record.task_id,
      name: linkedTask?.name ?? `任务 ${record.task_id.slice(0, 8)}`,
    });
    setRecordPage(1);
    setRecordPageSize(100);
    setActiveTab("records");
  }

  function handleInspectRecordChannel(record: PushRecord) {
    setFocusMode("none");
    setSelectedRecord(null);
    setRecordTaskFocus(null);
    setRecordStatusFilter("all");
    setRecordDiagnosticFilter("all");
    setRecordChannelFilter(record.channel_type);
    setRecordChannelIdFilter(record.channel_id);
    setRecordPage(1);
    setRecordPageSize(100);
    setActiveTab("records");
  }

  async function handlePreviewTemplate(template: PushTemplate, nextVariablesText?: string) {
    setPreviewError(null);
    setPreviewingTemplateId(template.id);

    try {
      const variables = parseVariablesJson(nextVariablesText ?? previewVariablesText);
      const result = await previewTemplateMutation.trigger({
        id: template.id,
        data: { variables },
      });
      setPreviewResult(result);
    } catch (error) {
      setPreviewResult(null);
      setPreviewError(getErrorMessage(error, "模板预览失败，请检查变量 JSON 是否正确。"));
    } finally {
      setPreviewingTemplateId(null);
    }
  }

  function handleSelectTemplate(template: PushTemplate) {
    const nextVariablesText = formatJson(template.default_values ?? {});
    setSelectedTemplate(template);
    setPreviewVariablesText(nextVariablesText);
    setPreviewResult(null);
    setPreviewError(null);
    setAutoPreviewedTemplateId(null);
  }

  async function persistTemplate(data: PushTemplateCreateData | PushTemplateUpdateData) {
    setFlashMessage(null);

    try {
      if (editingTemplate) {
        await updateTemplateMutation.trigger({
          id: editingTemplate.id,
          data: data as PushTemplateUpdateData,
        });
        setFlashMessage({ tone: "success", text: `模板「${editingTemplate.name}」已更新。` });
      } else {
        const created = await createTemplateMutation.trigger(data as PushTemplateCreateData);
        setSelectedTemplate(created);
        setPreviewVariablesText(formatJson(created.default_values ?? {}));
        setFlashMessage({ tone: "success", text: `模板「${created.name}」已创建。` });
      }

      await refreshPushData();
      setTemplateEditorOpen(false);
      setEditingTemplate(null);
      setTemplateDraftSource(null);
    } catch (error) {
      setFlashMessage({ tone: "error", text: getErrorMessage(error, "保存推送模板失败。") });
    }
  }

  async function handleSaveTemplate(data: PushTemplateCreateData | PushTemplateUpdateData) {
    if (editingTemplate && editingTemplate.is_enabled && "is_enabled" in data && data.is_enabled === false) {
      setTemplateDisableConfirmation({
        template: editingTemplate,
        data,
      });
      return;
    }

    await persistTemplate(data);
  }

  async function handleConfirmTemplateDisable() {
    if (!templateDisableConfirmation) return;

    const { data } = templateDisableConfirmation;
    setTemplateDisableConfirmation(null);
    await persistTemplate(data);
  }

  async function handleDeleteTemplate() {
    if (!deletingTemplate) return;

    setFlashMessage(null);

    try {
      await deleteTemplateMutation.trigger(deletingTemplate.id);
      await refreshPushData();

      if (selectedTemplate?.id === deletingTemplate.id) {
        setSelectedTemplate(null);
        setPreviewResult(null);
        setPreviewError(null);
        setPreviewVariablesText("{}");
      }

      setFlashMessage({ tone: "success", text: `模板「${deletingTemplate.name}」已删除。` });
      setDeletingTemplate(null);
    } catch (error) {
      setFlashMessage({ tone: "error", text: getErrorMessage(error, "删除推送模板失败。") });
    }
  }

  function handleInspectChannelRisk() {
    setFocusMode("channel-risk");
    setChannelEnabledFilter("false");
    setChannelPage(1);
    setChannelPageSize(100);
    setActiveTab("channels");
  }

  function handleInspectTaskRisk(filter: PushTaskRiskFilter = "risk") {
    setFocusMode("task-risk");
    setTaskEnabledFilter("true");
    setTaskRiskFilter(filter);
    setTaskPage(1);
    setTaskPageSize(100);
    setActiveTab("tasks");
  }

  function handleInspectTemplateRisk() {
    setFocusMode("template-risk");
    setTemplateEnabledFilter("false");
    setTemplatePage(1);
    setTemplatePageSize(100);
    setActiveTab("templates");
  }

  function handleInspectRecordRisk(filter: PushRecordDiagnosticFilter = "all") {
    setFocusMode("record-risk");
    setRecordStatusFilter("all");
    setRecordDiagnosticFilter(filter);
    setRecordTaskFocus(null);
    setRecordChannelFilter("all");
    setRecordChannelIdFilter("all");
    setSelectedRecordIds([]);
    setRecordPage(1);
    setRecordPageSize(100);
    setActiveTab("records");
  }

  function clearFocusMode() {
    setFocusMode("none");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              BG-101
            </Badge>
            <Badge variant="outline" className="border-border bg-muted/30 text-muted-foreground">
              推送中心
            </Badge>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">推送管理</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              把渠道、任务、记录和模板放到同一块工作台里，减少跨页面切换成本。
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-muted/20 py-3 lg:w-[420px]">
          <CardContent className="grid gap-3 px-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">执行健康度</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {stats.data ? `${stats.data.summary.success_rate.toFixed(1)}%` : "--"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                最近 30 天成功率，失败与重试会自动进入记录页追踪。
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">待处理压力</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {stats.data ? stats.data.summary.pending_count + stats.data.summary.retrying_count : "--"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                合并待处理与重试中的记录，方便快速判断是否需要人工介入。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {flashMessage && <PushFlashBanner message={flashMessage} />}

      <PushRiskRadar
        channels={taskEditorChannels.data?.items ?? []}
        stats={stats.data}
        tasks={recordFilterTasks.data?.items ?? []}
        templates={taskEditorTemplates.data?.items ?? []}
        onInspectChannelRisk={handleInspectChannelRisk}
        onInspectTaskRisk={handleInspectTaskRisk}
        onInspectRecordRisk={handleInspectRecordRisk}
        onInspectTemplateRisk={handleInspectTemplateRisk}
      />

      <PushStatsCards stats={stats.data} isLoading={stats.isLoading} />
      <PushAnalyticsPanel stats={stats.data} isLoading={stats.isLoading} />

      <Card className="border-border/40 bg-card/80">
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value ?? "channels")} className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  推送工作台
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  四个 tab 对应四类核心对象，详情查看统一走右侧 sheet，模板 tab 内置实时预览。
                </p>
              </div>
              {(channels.isLoading || tasks.isLoading || records.isLoading || templates.isLoading) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  同步最新推送数据
                </div>
              )}
            </div>

            <TabsList className="w-full justify-start bg-muted/40 p-1 sm:w-fit" variant="line">
              <TabsTrigger value="channels">渠道 {channels.data ? `(${channels.data.total})` : ""}</TabsTrigger>
              <TabsTrigger value="tasks">任务 {tasks.data ? `(${tasks.data.total})` : ""}</TabsTrigger>
              <TabsTrigger value="records">记录 {records.data ? `(${records.data.total})` : ""}</TabsTrigger>
              <TabsTrigger value="templates">模板 {templates.data ? `(${templates.data.total})` : ""}</TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="space-y-4">
              <PushChannelsTab
                channelTypeFilter={channelTypeFilter}
                channelEnabledFilter={channelEnabledFilter}
                data={channels.data}
                error={channels.error}
                focusMode={focusMode === "channel-risk" ? "risk" : "all"}
                isLoading={channels.isLoading}
                onEnterFocusMode={handleInspectChannelRisk}
                onClearFocusMode={clearFocusMode}
                taskOptions={recordFilterTasks.data?.items ?? []}
                togglingChannelId={togglingChannelId}
                onChannelTypeChange={(value) => {
                  setChannelTypeFilter(value);
                  setChannelPage(1);
                }}
                onChannelEnabledChange={(value) => {
                  setChannelEnabledFilter(value);
                  setChannelPage(1);
                }}
                onChannelPageChange={setChannelPage}
                onChannelPageSizeChange={(size) => {
                  setChannelPageSize(size);
                  setChannelPage(1);
                }}
                onCreateChannel={() => {
                  setEditingChannel(null);
                  setChannelDraftSource(null);
                  setChannelEditorOpen(true);
                }}
                onEditChannel={(channel) => {
                  setChannelDraftSource(null);
                  setEditingChannel(channel);
                  setChannelEditorOpen(true);
                }}
                onDuplicateChannel={(channel) => {
                  setEditingChannel(null);
                  setChannelDraftSource(channel);
                  setChannelEditorOpen(true);
                }}
                onDeleteChannel={setDeletingChannel}
                onViewChannel={setSelectedChannel}
                onToggleChannel={(channel) => void handleToggleChannel(channel)}
              />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <PushTasksTab
                taskTriggerFilter={taskTriggerFilter}
                taskStatusFilter={taskStatusFilter}
                taskEnabledFilter={taskEnabledFilter}
                taskRiskFilter={taskRiskFilter}
                data={tasks.data}
                channelOptions={taskEditorChannels.data?.items ?? []}
                error={tasks.error}
                focusMode={focusMode === "task-risk" ? "risk" : "all"}
                isLoading={tasks.isLoading}
                onEnterFocusMode={handleInspectTaskRisk}
                onClearFocusMode={clearFocusMode}
                templateOptions={taskEditorTemplates.data?.items ?? []}
                updatingTaskId={updatingTaskId}
                triggeringTaskId={triggeringTaskId}
                onTaskTriggerChange={(value) => {
                  setTaskTriggerFilter(value);
                  setTaskPage(1);
                }}
                onTaskStatusChange={(value) => {
                  setTaskStatusFilter(value);
                  setTaskPage(1);
                }}
                onTaskEnabledChange={(value) => {
                  setTaskEnabledFilter(value);
                  setTaskPage(1);
                }}
                onTaskRiskChange={(value) => {
                  setTaskRiskFilter(value);
                  setTaskPage(1);
                }}
                onTaskPageChange={setTaskPage}
                onTaskPageSizeChange={(size) => {
                  setTaskPageSize(size);
                  setTaskPage(1);
                }}
                onCreateTask={() => {
                  setEditingTask(null);
                  setTaskDraftSource(null);
                  setTaskEditorOpen(true);
                }}
                onEditTask={(task) => {
                  setTaskDraftSource(null);
                  setEditingTask(task);
                  setTaskEditorOpen(true);
                }}
                onDuplicateTask={(task) => {
                  setEditingTask(null);
                  setTaskDraftSource(task);
                  setTaskEditorOpen(true);
                }}
                onDeleteTask={setDeletingTask}
                onInspectTaskRecords={handleInspectTaskRecords}
                onViewTask={setSelectedTask}
                onToggleTask={(task) => void handleToggleTask(task)}
                onTriggerTask={(task) => void handleTriggerTask(task)}
              />
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              <PushRecordsTab
                recordStatusFilter={recordStatusFilter}
                recordChannelFilter={recordChannelFilter}
                recordChannelIdFilter={recordChannelIdFilter}
                recordDiagnosticFilter={recordDiagnosticFilter}
                taskOptions={recordFilterTasks.data?.items ?? []}
                channelOptions={recordFilterChannels.data?.items ?? []}
                selectedTaskId={recordTaskFocus?.id ?? null}
                focusedTaskName={recordTaskFocus?.name ?? null}
                data={records.data}
                error={records.error}
                focusMode={focusMode === "record-risk" ? "risk" : "all"}
                isLoading={records.isLoading}
                onEnterFocusMode={handleInspectRecordRisk}
                onClearFocusMode={clearFocusMode}
                retryingRecordId={retryingRecordId}
                onRecordStatusChange={(value) => {
                  setRecordStatusFilter(value);
                  setRecordPage(1);
                }}
                onRecordChannelChange={(value) => {
                  setRecordChannelFilter(value);
                  setRecordChannelIdFilter("all");
                  setRecordPage(1);
                }}
                onRecordChannelIdChange={(value) => {
                  setRecordChannelIdFilter(value);
                  setRecordPage(1);
                }}
                onRecordDiagnosticChange={(value) => {
                  setRecordDiagnosticFilter(value);
                  setSelectedRecordIds([]);
                  setRecordPage(1);
                }}
                onRecordTaskChange={(value) => {
                  const nextTask =
                    value === "all"
                      ? null
                      : (recordFilterTasks.data?.items ?? []).find((task) => task.id === value) ?? null;
                  setRecordTaskFocus(nextTask ? { id: nextTask.id, name: nextTask.name } : null);
                  setRecordPage(1);
                }}
                onClearTaskFilter={() => {
                  setRecordTaskFocus(null);
                  setRecordPage(1);
                }}
                onRecordPageChange={setRecordPage}
                onRecordPageSizeChange={(size) => {
                  setRecordPageSize(size);
                  setRecordPage(1);
                }}
                onViewRecord={setSelectedRecord}
                selectedRecordIds={selectedRecordIds}
                selectedRecordTaskCount={selectedRetryableTaskIds.length}
                selectedRecordTaskName={selectedRetryableTaskName}
                onToggleRecordSelection={(recordId, checked) =>
                  setSelectedRecordIds((current) =>
                    checked ? [...new Set([...current, recordId])] : current.filter((id) => id !== recordId)
                  )
                }
                onSelectRetryableRecords={(recordIds) => setSelectedRecordIds(recordIds)}
                onClearRecordSelection={() => setSelectedRecordIds([])}
                onFocusSelectedTask={handleFocusSelectedRecordTask}
                onRetryRecord={(record) => void handleRetryRecord(record)}
                onRetrySelectedRecords={() => void handleBatchRetryRecords()}
                isBatchRetrying={batchRetryingRecords}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <PushTemplatesTab
                templateEnabledFilter={templateEnabledFilter}
                data={templates.data}
                error={templates.error}
                focusMode={focusMode === "template-risk" ? "risk" : "all"}
                isLoading={templates.isLoading}
                onEnterFocusMode={handleInspectTemplateRisk}
                onClearFocusMode={clearFocusMode}
                selectedTemplate={selectedTemplate}
                taskOptions={recordFilterTasks.data?.items ?? []}
                previewVariablesText={previewVariablesText}
                previewResult={previewResult}
                previewError={previewError}
                previewingTemplateId={previewingTemplateId}
                onTemplateEnabledChange={(value) => {
                  setTemplateEnabledFilter(value);
                  setTemplatePage(1);
                }}
                onTemplatePageChange={setTemplatePage}
                onTemplatePageSizeChange={(size) => {
                  setTemplatePageSize(size);
                  setTemplatePage(1);
                }}
                onCreateTemplate={() => {
                  setEditingTemplate(null);
                  setTemplateDraftSource(null);
                  setTemplateEditorOpen(true);
                }}
                onSelectTemplate={handleSelectTemplate}
                onEditTemplate={(template) => {
                  setTemplateDraftSource(null);
                  setEditingTemplate(template);
                  setTemplateEditorOpen(true);
                }}
                onDuplicateTemplate={(template) => {
                  setEditingTemplate(null);
                  setTemplateDraftSource(template);
                  setTemplateEditorOpen(true);
                }}
                onDeleteTemplate={setDeletingTemplate}
                onViewTemplate={setDetailTemplate}
                onPreviewVariablesTextChange={setPreviewVariablesText}
                onPreview={() => selectedTemplate && void handlePreviewTemplate(selectedTemplate)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PushMetricHints stats={stats.data} />

      <PushChannelSheet
        channel={selectedChannel}
        open={!!selectedChannel}
        onOpenChange={(open) => !open && setSelectedChannel(null)}
        onInspectRecords={(channel) => {
          setSelectedChannel(null);
          handleInspectChannelRecords(channel);
        }}
        onInspectRisk={() => {
          setSelectedChannel(null);
          handleInspectChannelRisk();
        }}
      />
      <PushChannelEditorSheet
        channel={editingChannel}
        initialChannel={channelDraftSource}
        open={channelEditorOpen}
        onOpenChange={(open) => {
          setChannelEditorOpen(open);
          if (!open) {
            setEditingChannel(null);
            setChannelDraftSource(null);
          }
        }}
        onSave={(data) => void handleSaveChannel(data)}
        isSaving={createChannelMutation.isMutating || updateChannelMutation.isMutating}
      />
      <PushTaskEditorSheet
        task={editingTask}
        initialTask={taskDraftSource}
        channels={taskEditorChannels.data?.items ?? []}
        templates={taskEditorTemplates.data?.items ?? []}
        open={taskEditorOpen}
        onOpenChange={(open) => {
          setTaskEditorOpen(open);
          if (!open) {
            setEditingTask(null);
            setTaskDraftSource(null);
          }
        }}
        onSave={(data) => void handleSaveTask(data)}
        isSaving={createTaskMutation.isMutating || updateTaskMutation.isMutating}
      />
      <PushTaskTriggerSheet
        task={triggerTaskDraft}
        channels={taskEditorChannels.data?.items ?? []}
        templates={taskEditorTemplates.data?.items ?? []}
        open={taskTriggerSheetOpen}
        onOpenChange={(open) => {
          setTaskTriggerSheetOpen(open);
          if (!open) {
            setTriggerTaskDraft(null);
          }
        }}
        onSubmit={(data) => triggerTaskDraft && void handleSubmitTaskTrigger(triggerTaskDraft, data)}
        isSubmitting={Boolean(triggerTaskDraft && triggeringTaskId === triggerTaskDraft.id)}
      />
      <PushTaskSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onInspectRecords={(task) => {
          setSelectedTask(null);
          handleInspectTaskRecords(task);
        }}
        onTriggerTask={(task) => {
          setSelectedTask(null);
          void handleTriggerTask(task);
        }}
      />
      <PushRecordSheet
        record={selectedRecord}
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
        onInspectTask={handleInspectRecordTask}
        onInspectChannel={handleInspectRecordChannel}
        onRetryRecord={(record) => void handleRetryRecord(record)}
        retrying={Boolean(selectedRecord && retryingRecordId === selectedRecord.id)}
      />
      <PushTemplateSheet template={detailTemplate} open={!!detailTemplate} onOpenChange={(open) => !open && setDetailTemplate(null)} />
      <PushTemplateEditorSheet
        template={editingTemplate}
        initialTemplate={templateDraftSource}
        open={templateEditorOpen}
        onOpenChange={(open) => {
          setTemplateEditorOpen(open);
          if (!open) {
            setEditingTemplate(null);
            setTemplateDraftSource(null);
          }
        }}
        onSave={(data) => void handleSaveTemplate(data)}
        isSaving={createTemplateMutation.isMutating || updateTemplateMutation.isMutating}
      />
      <ConfirmDialog
        open={!!templateDisableConfirmation}
        onOpenChange={(open) => {
          if (!open) {
            setTemplateDisableConfirmation(null);
          }
        }}
        title={templateDisableConfirmation ? `停用模板「${templateDisableConfirmation.template.name}」` : "停用推送模板"}
        description={
          templateDisableConfirmation
            ? buildTemplateDependencyMessage(templateDisableConfirmation.template, dependencyTasks, "disable")
            : "停用后，相关任务将无法继续使用该模板。"
        }
        confirmText="继续停用"
        cancelText="取消"
        variant="default"
        onConfirm={() => void handleConfirmTemplateDisable()}
        loading={updateTemplateMutation.isMutating}
      />
      <ConfirmDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTemplate(null);
          }
        }}
        title="删除推送模板"
        description={
          deletingTemplate
            ? buildTemplateDependencyMessage(deletingTemplate, dependencyTasks, "delete")
            : "确定要删除当前模板吗？此操作不可撤销。"
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={() => void handleDeleteTemplate()}
        loading={deleteTemplateMutation.isMutating}
      />
      <ConfirmDialog
        open={!!channelDisableConfirmation}
        onOpenChange={(open) => {
          if (!open) {
            setChannelDisableConfirmation(null);
          }
        }}
        title={channelDisableConfirmation ? `停用渠道「${channelDisableConfirmation.channel.name}」` : "停用推送渠道"}
        description={
          channelDisableConfirmation
            ? buildChannelDependencyMessage(channelDisableConfirmation.channel, dependencyTasks, "disable")
            : "停用后将不会继续通过该渠道发送。"
        }
        confirmText={channelDisableConfirmation?.mode === "save" ? "继续保存" : "继续停用"}
        cancelText="取消"
        variant="default"
        onConfirm={() => void handleConfirmChannelDisable()}
        loading={updateChannelMutation.isMutating}
      />
      <ConfirmDialog
        open={!!deletingChannel}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingChannel(null);
          }
        }}
        title="删除推送渠道"
        description={
          deletingChannel
            ? buildChannelDependencyMessage(deletingChannel, dependencyTasks, "delete")
            : "确定要删除当前渠道吗？此操作不可撤销。"
        }
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={() => void handleDeleteChannel()}
        loading={deleteChannelMutation.isMutating}
      />
      <ConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTask(null);
          }
        }}
        title="删除推送任务"
        description={`确定要删除任务“${deletingTask?.name}”吗？相关历史记录会保留，但任务本身将不再可用。`}
        confirmText="删除"
        cancelText="取消"
        variant="destructive"
        onConfirm={() => void handleDeleteTask()}
        loading={deleteTaskMutation.isMutating}
      />
    </div>
  );
}

function parseVariablesJson(value: string) {
  const parsed = value.trim() ? JSON.parse(value) : {};
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("模板变量必须是 JSON 对象。");
  }
  return parsed as Record<string, unknown>;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
