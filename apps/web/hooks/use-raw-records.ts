import useSWR from 'swr';
import { getRawRecords, getRawRecord, RawRecordsFilter } from '@/lib/api/raw-records';
import { RawRecord } from '@/types';
import { PaginatedResponse } from '@/lib/api';

export function useRawRecords(filter?: RawRecordsFilter) {
  const key = ['raw-records', filter];
  return useSWR<PaginatedResponse<RawRecord>>(key, () => getRawRecords(filter));
}

export function useRawRecord(id: string | null) {
  return useSWR<RawRecord>(id ? `raw-record-${id}` : null, () => getRawRecord(id!));
}