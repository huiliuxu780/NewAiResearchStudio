import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  createPushTask,
  createPushChannel,
  createPushTemplate,
  deletePushChannel,
  deletePushTask,
  deletePushTemplate,
  disablePushTask,
  enablePushTask,
  getPushChannel,
  getPushChannels,
  getPushRecord,
  getPushRecords,
  getPushStats,
  getPushTask,
  getPushTasks,
  getPushTemplate,
  getPushTemplates,
  previewPushTemplate,
  retryPushRecord,
  triggerPushTask,
  updatePushTask,
  updatePushTemplate,
  updatePushChannel,
} from '@/lib/api/push';
import type {
  PreviewPushTemplateData,
  PushChannel,
  PushChannelCreateData,
  PushChannelsFilter,
  PushChannelUpdateData,
  PushRecord,
  PushRecordsFilter,
  PushStats,
  PushTask,
  PushTaskCreateData,
  PushTasksFilter,
  PushTaskUpdateData,
  PushTemplate,
  PushTemplateCreateData,
  PushTemplatesFilter,
  PushTemplatePreview,
  PushTemplateUpdateData,
  RetryPushRecordData,
  TriggerPushTaskData,
} from '@/types/push';
import type { PaginatedResponse } from '@/lib/api';

export function usePushStats(days = 30) {
  return useSWR<PushStats>(['push-stats', days], () => getPushStats(days));
}

export function usePushChannels(filter?: PushChannelsFilter) {
  const key = ['push-channels', filter];
  return useSWR<PaginatedResponse<PushChannel>>(key, () => getPushChannels(filter));
}

export function usePushChannel(id: string | null) {
  return useSWR<PushChannel>(id ? `push-channel-${id}` : null, () => getPushChannel(id!));
}

export function useCreatePushChannel() {
  return useSWRMutation(
    'push-channel-create',
    async (_key: string, { arg }: { arg: PushChannelCreateData }) => createPushChannel(arg)
  );
}

export function useUpdatePushChannel() {
  return useSWRMutation(
    'push-channel-update',
    async (_key: string, { arg }: { arg: { id: string; data: PushChannelUpdateData } }) => updatePushChannel(arg.id, arg.data)
  );
}

export function useDeletePushChannel() {
  return useSWRMutation(
    'push-channel-delete',
    async (_key: string, { arg }: { arg: string }) => deletePushChannel(arg)
  );
}

export function usePushTasks(filter?: PushTasksFilter) {
  const key = ['push-tasks', filter];
  return useSWR<PaginatedResponse<PushTask>>(key, () => getPushTasks(filter));
}

export function usePushTask(id: string | null) {
  return useSWR<PushTask>(id ? `push-task-${id}` : null, () => getPushTask(id!));
}

export function useCreatePushTask() {
  return useSWRMutation(
    'push-task-create',
    async (_key: string, { arg }: { arg: PushTaskCreateData }) => createPushTask(arg)
  );
}

export function useUpdatePushTask() {
  return useSWRMutation(
    'push-task-update',
    async (_key: string, { arg }: { arg: { id: string; data: PushTaskUpdateData } }) => updatePushTask(arg.id, arg.data)
  );
}

export function useEnablePushTask() {
  return useSWRMutation('push-task-enable', async (_key: string, { arg }: { arg: string }) => enablePushTask(arg));
}

export function useDisablePushTask() {
  return useSWRMutation('push-task-disable', async (_key: string, { arg }: { arg: string }) => disablePushTask(arg));
}

export function useDeletePushTask() {
  return useSWRMutation(
    'push-task-delete',
    async (_key: string, { arg }: { arg: string }) => deletePushTask(arg)
  );
}

export function useTriggerPushTask() {
  return useSWRMutation(
    'push-task-trigger',
    async (_key: string, { arg }: { arg: { id: string; data?: TriggerPushTaskData } }) => triggerPushTask(arg.id, arg.data)
  );
}

export function usePushRecords(filter?: PushRecordsFilter) {
  const key = ['push-records', filter];
  return useSWR<PaginatedResponse<PushRecord>>(key, () => getPushRecords(filter));
}

export function usePushRecord(id: string | null) {
  return useSWR<PushRecord>(id ? `push-record-${id}` : null, () => getPushRecord(id!));
}

export function useRetryPushRecord() {
  return useSWRMutation(
    'push-record-retry',
    async (_key: string, { arg }: { arg: { id: string; data?: RetryPushRecordData } }) => retryPushRecord(arg.id, arg.data)
  );
}

export function usePushTemplates(filter?: PushTemplatesFilter) {
  const key = ['push-templates', filter];
  return useSWR<PaginatedResponse<PushTemplate>>(key, () => getPushTemplates(filter));
}

export function usePushTemplate(id: string | null) {
  return useSWR<PushTemplate>(id ? `push-template-${id}` : null, () => getPushTemplate(id!));
}

export function useCreatePushTemplate() {
  return useSWRMutation(
    'push-template-create',
    async (_key: string, { arg }: { arg: PushTemplateCreateData }) => createPushTemplate(arg)
  );
}

export function useUpdatePushTemplate() {
  return useSWRMutation(
    'push-template-update',
    async (_key: string, { arg }: { arg: { id: string; data: PushTemplateUpdateData } }) => {
      return updatePushTemplate(arg.id, arg.data);
    }
  );
}

export function useDeletePushTemplate() {
  return useSWRMutation(
    'push-template-delete',
    async (_key: string, { arg }: { arg: string }) => deletePushTemplate(arg)
  );
}

export function usePreviewPushTemplate() {
  return useSWRMutation(
    'push-template-preview',
    async (_key: string, { arg }: { arg: { id: string; data: PreviewPushTemplateData } }) => {
      return previewPushTemplate(arg.id, arg.data) as Promise<PushTemplatePreview>;
    }
  );
}
