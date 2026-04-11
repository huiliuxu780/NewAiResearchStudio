import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  getCrawlTasks,
  getCrawlTask,
  createCrawlTask,
  cancelCrawlTask,
  getCrawlTaskStats,
  CrawlTasksFilter,
  CreateCrawlTaskData,
} from '@/lib/api/crawl-tasks';
import { CrawlTask, CrawlTaskStats, PaginatedResponse } from '@/types/crawl-tasks';

export function useCrawlTasks(filter?: CrawlTasksFilter) {
  const key = ['crawl-tasks', filter];
  return useSWR<PaginatedResponse<CrawlTask>>(key, () => getCrawlTasks(filter));
}

export function useCrawlTask(id: string | null) {
  return useSWR<CrawlTask>(id ? `crawl-task-${id}` : null, () => getCrawlTask(id!));
}

export function useCreateCrawlTask() {
  return useSWRMutation('crawl-tasks-create', async (_key: string, { arg }: { arg: CreateCrawlTaskData }) => {
    return createCrawlTask(arg);
  });
}

export function useCancelCrawlTask() {
  return useSWRMutation('crawl-tasks-cancel', async (_key: string, { arg }: { arg: string }) => {
    return cancelCrawlTask(arg);
  });
}

export function useCrawlTaskStats() {
  return useSWR<CrawlTaskStats>('crawl-tasks-stats', () => getCrawlTaskStats());
}
