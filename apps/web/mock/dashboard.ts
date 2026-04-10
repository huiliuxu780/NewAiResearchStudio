import { DashboardStats, CompanyStats, Company } from '@/types';

export const mockDashboardStats: DashboardStats = {
  totalSources: 11,
  activeSources: 10,
  totalRawRecords: 23,
  pendingRawRecords: 3,
  totalFacts: 18,
  pendingReviewFacts: 4,
  totalInsights: 12,
  publishedInsights: 10,
  weeklyNewRecords: 8,
  weeklyNewFacts: 6,
  weeklyNewInsights: 4,
};

export const mockCompanyStats: CompanyStats[] = [
  {
    company: Company.ALIBABA,
    recordCount: 6,
    factCount: 5,
    insightCount: 3,
    lastActivityAt: '2026-04-10T08:00:00Z',
  },
  {
    company: Company.BYTE_DANCE,
    recordCount: 6,
    factCount: 5,
    insightCount: 3,
    lastActivityAt: '2026-04-10T08:00:00Z',
  },
  {
    company: Company.TENCENT,
    recordCount: 6,
    factCount: 5,
    insightCount: 3,
    lastActivityAt: '2026-04-10T08:00:00Z',
  },
  {
    company: Company.HUAWEI,
    recordCount: 1,
    factCount: 1,
    insightCount: 1,
    lastActivityAt: '2026-04-10T07:00:00Z',
  },
  {
    company: Company.BAIDU,
    recordCount: 1,
    factCount: 1,
    insightCount: 1,
    lastActivityAt: '2026-04-08T08:00:00Z',
  },
];

export const getDashboardStats = (): DashboardStats => {
  return mockDashboardStats;
};

export const getCompanyStats = (): CompanyStats[] => {
  return mockCompanyStats;
};

export const getCompanyStatsByCompany = (company: Company): CompanyStats | undefined => {
  return mockCompanyStats.find((stat) => stat.company === company);
};

export const mockTrendData = [
  { date: '4/4', count: 3 },
  { date: '4/5', count: 5 },
  { date: '4/6', count: 4 },
  { date: '4/7', count: 6 },
  { date: '4/8', count: 8 },
  { date: '4/9', count: 7 },
  { date: '4/10', count: 9 },
];

export const getTrendData = () => {
  return mockTrendData;
};

export const getTrendDataByCompany = (company: Company | null) => {
  if (!company) {
    return mockTrendData;
  }
  const companyFactor = company === Company.ALIBABA ? 0.4 :
    company === Company.BYTE_DANCE ? 0.35 :
    company === Company.TENCENT ? 0.25 : 0.1;
  return mockTrendData.map(item => ({
    date: item.date,
    count: Math.round(item.count * companyFactor),
  }));
};