import useSWR from 'swr';
import { getInsights, getInsight, InsightsFilter } from '@/lib/api/insights';
import { Insight, PaginatedResponse } from '@/types/entities';
import { useDataSource } from './use-data-source';

export function useInsights(filter?: InsightsFilter) {
  const { isMock } = useDataSource();
  const key = ['insights', filter];

  if (isMock) {
    return useSWR<PaginatedResponse<Insight>>(key, () => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    }));
  }

  return useSWR<PaginatedResponse<Insight>>(key, () => getInsights(filter));
}

export function useInsight(id: string | null) {
  return useSWR<Insight>(id ? `insight-${id}` : null, () => getInsight(id!));
}