import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getReports, generateReport, getReport, deleteReport, ReportsFilter, GenerateReportData } from '@/lib/api/reports';
import { WeeklyReport, PaginatedResponse } from '@/types/reports';

export function useReports(filter?: ReportsFilter) {
  const key = ['reports', filter];
  return useSWR<PaginatedResponse<WeeklyReport>>(key, () => getReports(filter));
}

export function useReport(id: string | null) {
  return useSWR<WeeklyReport>(id ? `report-${id}` : null, () => getReport(id!));
}

export function useGenerateReport() {
  return useSWRMutation('reports-generate', async (_key: string, { arg }: { arg: GenerateReportData }) => {
    return generateReport(arg);
  });
}

export function useDeleteReport() {
  return useSWRMutation('reports-delete', async (_key: string, { arg }: { arg: string }) => {
    return deleteReport(arg);
  });
}
