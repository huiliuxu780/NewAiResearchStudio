export const Company = {
  ALIBABA: 'alibaba',
  BYTE_DANCE: 'byte_dance',
  TENCENT: 'tencent',
} as const;

export type Company = typeof Company[keyof typeof Company];

export const SourceType = {
  OFFICIAL_BLOG: 'official_blog',
  TECH_ARTICLE: 'tech_article',
  NEWS_REPORT: 'news_report',
  SOCIAL_MEDIA: 'social_media',
  RESEARCH_PAPER: 'research_paper',
  CONFERENCE: 'conference',
  INTERNAL_DOC: 'internal_doc',
  OTHER: 'other',
} as const;

export type SourceType = typeof SourceType[keyof typeof SourceType];

export const EventType = {
  RELEASE: 'release',
  UPDATE: 'update',
  ACQUISITION: 'acquisition',
  INVESTMENT: 'investment',
  PARTNERSHIP: 'partnership',
  COMPETITION: 'competition',
  PERSONNEL_CHANGE: 'personnel_change',
  FINANCIAL_REPORT: 'financial_report',
  LEGAL_LAWSUIT: 'legal_lawsuit',
  REGULATORY_PENALTY: 'regulatory_penalty',
  OTHER: 'other',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

export const ReviewStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  INSIGHT_GENERATED: 'insight_generated',
} as const;

export type ReviewStatus = typeof ReviewStatus[keyof typeof ReviewStatus];

export const CrawlStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type CrawlStatus = typeof CrawlStatus[keyof typeof CrawlStatus];

export const DedupeStatus = {
  PENDING: 'pending',
  NEW: 'new',
  DUPLICATE: 'duplicate',
  EXTRACTED: 'extracted',
  EXTRACTED_EMPTY: 'extracted_empty',
} as const;

export type DedupeStatus = typeof DedupeStatus[keyof typeof DedupeStatus];

export const ImportanceLevel = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type ImportanceLevel = typeof ImportanceLevel[keyof typeof ImportanceLevel];

export const ConfidenceLevel = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type ConfidenceLevel = typeof ConfidenceLevel[keyof typeof ConfidenceLevel];

export const InsightType = {
  COMPETITIVE_ADVANTAGE: 'competitive_advantage',
  RISK_WARNING: 'risk_warning',
  GROWTH_OPPORTUNITY: 'growth_opportunity',
  OPERATIONAL_EFFICIENCY: 'operational_efficiency',
  MARKET_POSITION: 'market_position',
} as const;

export type InsightType = typeof InsightType[keyof typeof InsightType];

export const ImpactLevel = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type ImpactLevel = typeof ImpactLevel[keyof typeof ImpactLevel];

export const Priority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type Priority = typeof Priority[keyof typeof Priority];