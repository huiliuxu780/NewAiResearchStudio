import useSWR from 'swr';
import { getDashboardStats, getCompanyStats, getTrendData } from '@/lib/api/dashboard';
import { DashboardStats, CompanyStats } from '@/types';

export function useDashboardStats() {
  return useSWR<DashboardStats>('dashboard-stats', getDashboardStats);
}

export function useCompanyStats() {
  return useSWR<CompanyStats[]>('company-stats', getCompanyStats);
}

export function useTrendData(company?: string) {
  const key = company ? ['trend-data', company] : 'trend-data';
  return useSWR<{ date: string; count: number }[]>(key, () => getTrendData(company));
}