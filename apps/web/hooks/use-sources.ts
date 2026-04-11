import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getSources, getSource, createSource, updateSource, deleteSource, SourcesFilter, CreateSourceData, UpdateSourceData } from '@/lib/api/sources';
import { Source, PaginatedResponse } from '@/types/entities';
import { useDataSource } from './use-data-source';

export function useSources(filter?: SourcesFilter) {
  const { isMock } = useDataSource();
  const key = ['sources', filter];

  if (isMock) {
    return useSWR<PaginatedResponse<Source>>(key, () => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    }));
  }

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