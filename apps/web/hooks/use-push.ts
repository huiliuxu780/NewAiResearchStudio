import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
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
  updatePushChannel,
} from '@/lib/api/push';
import type {
  PreviewPushTemplateData,
  PushChannel,
  PushChannelsFilter,
  PushRecord,
  PushRecordsFilter,
  PushStats,
  PushTask,
  PushTasksFilter,
  PushTemplate,
  PushTemplatesFilter,
  PushTemplatePreview,
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

export function useUpdatePushChannel() {
  return useSWRMutation(
    'push-channel-update',
    async (_key: string, { arg }: { arg: { id: string; data: Partial<Pick<PushChannel, 'is_enabled'>> } }) => {
      return updatePushChannel(arg.id, arg.data);
    }
  );
}

export function usePushTasks(filter?: PushTasksFilter) {
  const key = ['push-tasks', filter];
  return useSWR<PaginatedResponse<PushTask>>(key, () => getPushTasks(filter));
}

export function usePushTask(id: string | null) {
  return useSWR<PushTask>(id ? `push-task-${id}` : null, () => getPushTask(id!));
}

export function useEnablePushTask() {
  return useSWRMutation('push-task-enable', async (_key: string, { arg }: { arg: string }) => enablePushTask(arg));
}

export function useDisablePushTask() {
  return useSWRMutation('push-task-disable', async (_key: string, { arg }: { arg: string }) => disablePushTask(arg));
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

export function usePreviewPushTemplate() {
  return useSWRMutation(
    'push-template-preview',
    async (_key: string, { arg }: { arg: { id: string; data: PreviewPushTemplateData } }) => {
      return previewPushTemplate(arg.id, arg.data) as Promise<PushTemplatePreview>;
    }
  );
}
