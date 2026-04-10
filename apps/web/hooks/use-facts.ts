import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getFacts, getFact, updateFactReview, FactsFilter, UpdateFactReviewData } from '@/lib/api/facts';
import { Fact } from '@/types';
import { PaginatedResponse } from '@/lib/api';

export function useFacts(filter?: FactsFilter) {
  const key = ['facts', filter];
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