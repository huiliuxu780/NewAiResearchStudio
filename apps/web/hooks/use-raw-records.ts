import useSWR from 'swr';
import { getRawRecords, getRawRecord, RawRecordsFilter } from '@/lib/api/raw-records';
import { RawRecord, PaginatedResponse } from '@/types/entities';
import { useDataSource } from './use-data-source';

export function useRawRecords(filter?: RawRecordsFilter) {
  const { isMock } = useDataSource();
  const key = ['raw-records', filter];

  if (isMock) {
    return useSWR<PaginatedResponse<RawRecord>>(key, () => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 0,
    }));
  }

  return useSWR<PaginatedResponse<RawRecord>>(key, () => getRawRecords(filter));
}

export function useRawRecord(id: string | null) {
  return useSWR<RawRecord>(id ? `raw-record-${id}` : null, () => getRawRecord(id!));
}