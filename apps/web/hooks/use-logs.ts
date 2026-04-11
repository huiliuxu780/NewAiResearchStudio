import useSWR from 'swr';
import { getOperationLogs, getAILogs, OperationLogsFilter, AILogsFilter } from '@/lib/api/logs';
import { OperationLog, AILog, PaginatedResponse } from '@/types/logs';

export function useOperationLogs(filter?: OperationLogsFilter) {
  const key = ['operation-logs', filter];
  return useSWR<PaginatedResponse<OperationLog>>(key, () => getOperationLogs(filter));
}

export function useAILogs(filter?: AILogsFilter) {
  const key = ['ai-logs', filter];
  return useSWR<PaginatedResponse<AILog>>(key, () => getAILogs(filter));
}
