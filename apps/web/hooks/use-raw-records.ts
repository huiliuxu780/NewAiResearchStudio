import useSWR from 'swr';
import { getRawRecords, getRawRecord, RawRecordsFilter } from '@/lib/api/raw-records';
import { RawRecord, PaginatedResponse } from '@/types/entities';
import { useDataSource } from './use-data-source';

export function useRawRecords(filter?: RawRecordsFilter) {
  const { isMock } = useDataSource();
  const key = ['raw-records', filter];
  const fetcher = isMock
    ? async () => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    })
    : async () => getRawRecords(filter);

  return useSWR<PaginatedResponse<RawRecord>>(key, fetcher);
}

export function useRawRecord(id: string | null) {
  return useSWR<RawRecord>(id ? `raw-record-${id}` : null, () => getRawRecord(id!));
}
