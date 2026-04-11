import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getFacts, getFact, updateFactReview, FactsFilter, UpdateFactReviewData } from '@/lib/api/facts';
import { Fact, PaginatedResponse } from '@/types/entities';
import { useDataSource } from './use-data-source';

export function useFacts(filter?: FactsFilter) {
  const { isMock } = useDataSource();
  const key = ['facts', filter];

  if (isMock) {
    return useSWR<PaginatedResponse<Fact>>(key, () => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    }));
  }

  return useSWR<PaginatedResponse<Fact>>(key, () => getFacts(filter));
}

export function useFact(id: string | null) {
  return useSWR<Fact>(id ? `fact-${id}` : null, () => getFact(id!));
}

export function useUpdateFactReview() {
  return useSWRMutation('fact-review', async (_key: string, { arg }: { arg: { id: string; data: UpdateFactReviewData } }) => {
    return updateFactReview(arg.id, arg.data);
  });
}