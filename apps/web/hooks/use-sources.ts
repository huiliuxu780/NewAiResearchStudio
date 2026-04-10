import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getSources, getSource, createSource, updateSource, deleteSource, SourcesFilter, CreateSourceData, UpdateSourceData } from '@/lib/api/sources';
import { Source } from '@/types';
import { PaginatedResponse } from '@/lib/api';

export function useSources(filter?: SourcesFilter) {
  const key = ['sources', filter];
  return useSWR<PaginatedResponse<Source>>(key, () => getSources(filter));
}

export function useSource(id: string | null) {
  return useSWR<Source>(id ? `source-${id}` : null, () => getSource(id!));
}

export function useCreateSource() {
  return useSWRMutation('sources-create', async (_key: string, { arg }: { arg: CreateSourceData }) => {
    return createSource(arg);
  });
}

export function useUpdateSource(id: string) {
  return useSWRMutation(`source-update-${id}`, async (_key: string, { arg }: { arg: UpdateSourceData }) => {
    return updateSource(id, arg);
  });
}

export function useDeleteSource() {
  return useSWRMutation('sources-delete', async (_key: string, { arg }: { arg: string }) => {
    return deleteSource(arg);
  });
}