import useSWR from 'swr';
import { getInsights, getInsight, InsightsFilter } from '@/lib/api/insights';
import { Insight } from '@/types';
import { PaginatedResponse } from '@/lib/api';

export function useInsights(filter?: InsightsFilter) {
  const key = ['insights', filter];
  return useSWR<PaginatedResponse<Insight>>(key, () => getInsights(filter));
}

export function useInsight(id: string | null) {
  return useSWR<Insight>(id ? `insight-${id}` : null, () => getInsight(id!));
}