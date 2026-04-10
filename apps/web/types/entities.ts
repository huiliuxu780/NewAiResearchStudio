import {
  Company,
  SourceType,
  EventType,
  RawRecordStatus,
  FactStatus,
  InsightStatus,
  InsightType,
  Priority,
  WeekReportStatus,
} from './enums';

export interface Source {
  id: string;
  name: string;
  company: Company;
  type: SourceType;
  url: string;
  description: string;
  isActive: boolean;
  lastFetchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RawRecord {
  id: string;
  sourceId: string;
  source: Source;
  title: string;
  content: string;
  originalUrl: string;
  publishedAt: string;
  fetchedAt: string;
  status: RawRecordStatus;
  company: Company;
  eventType: EventType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Fact {
  id: string;
  rawRecordId: string;
  rawRecord: RawRecord;
  title: string;
  content: string;
  summary: string;
  company: Company;
  eventType: EventType;
  status: FactStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: InsightType;
  status: InsightStatus;
  priority: Priority;
  relatedFactIds: string[];
  relatedFacts: Fact[];
  author: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModelProfile {
  id: string;
  name: string;
  company: Company;
  description: string;
  version: string;
  releaseDate: string;
  capabilities: string[];
  limitations: string[];
  parameters: string;
  contextWindow: string;
  pricing: string;
  status: 'active' | 'deprecated' | 'beta';
  relatedFacts: Fact[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductProfile {
  id: string;
  name: string;
  company: Company;
  description: string;
  category: string;
  launchDate: string;
  features: string[];
  targetUsers: string[];
  pricing: string;
  status: 'active' | 'discontinued' | 'beta';
  relatedFacts: Fact[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  companies: Company[];
  keywords: string[];
  relatedInsights: Insight[];
  createdAt: string;
  updatedAt: string;
}

export interface WeekReport {
  id: string;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  content: string;
  summary: string;
  status: WeekReportStatus;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSources: number;
  activeSources: number;
  totalRawRecords: number;
  pendingRawRecords: number;
  totalFacts: number;
  pendingReviewFacts: number;
  totalInsights: number;
  publishedInsights: number;
  weeklyNewRecords: number;
  weeklyNewFacts: number;
  weeklyNewInsights: number;
}

export interface CompanyStats {
  company: Company;
  recordCount: number;
  factCount: number;
  insightCount: number;
  lastActivityAt: string | null;
}