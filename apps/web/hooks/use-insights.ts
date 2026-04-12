import useSWR from 'swr';
import { getInsights, getInsight, InsightsFilter } from '@/lib/api/insights';
import { Insight, PaginatedResponse } from '@/types/entities';
import { useDataSource } from './use-data-source';

export function useInsights(filter?: InsightsFilter) {
  const { isMock } = useDataSource();
  const key = ['insights', filter];
  const fetcher = isMock
    ? async () => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    })
    : async () => getInsights(filter);

  return useSWR<PaginatedResponse<Insight>>(key, fetcher);
}

export function useInsight(id: string | null) {
  return useSWR<Insight>(id ? `insight-${id}` : null, () => getInsight(id!));
}
