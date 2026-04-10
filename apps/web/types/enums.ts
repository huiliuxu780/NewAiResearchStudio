export enum Company {
  ALIBABA = 'alibaba',
  BYTE_DANCE = 'byte_dance',
  TENCENT = 'tencent',
  BAIDU = 'baidu',
  HUAWEI = 'huawei',
  XIAOMI = 'xiaomi',
  MEITUAN = 'meituan',
  JD = 'jd',
  KUAISHOU = 'kuaishou',
  OTHER = 'other',
}

export enum SourceType {
  OFFICIAL_BLOG = 'official_blog',
  TECH_ARTICLE = 'tech_article',
  NEWS_REPORT = 'news_report',
  SOCIAL_MEDIA = 'social_media',
  RESEARCH_PAPER = 'research_paper',
  CONFERENCE = 'conference',
  INTERNAL_DOC = 'internal_doc',
  OTHER = 'other',
}

export enum EventType {
  PRODUCT_LAUNCH = 'product_launch',
  MODEL_RELEASE = 'model_release',
  TECH_UPDATE = 'tech_update',
  STRATEGY_CHANGE = 'strategy_change',
  PERSONNEL_CHANGE = 'personnel_change',
  PARTNERSHIP = 'partnership',
  INVESTMENT = 'investment',
  ACQUISITION = 'acquisition',
  OTHER = 'other',
}

export enum RawRecordStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FactStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum InsightStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  ARCHIVED = 'archived',
}

export enum InsightType {
  TREND_ANALYSIS = 'trend_analysis',
  COMPETITIVE_INTELLIGENCE = 'competitive_intelligence',
  PRODUCT_ANALYSIS = 'product_analysis',
  TECH_EVALUATION = 'tech_evaluation',
  MARKET_INSIGHT = 'market_insight',
  STRATEGIC_RECOMMENDATION = 'strategic_recommendation',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum WeekReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}