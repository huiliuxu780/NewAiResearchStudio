export interface CrawlConfig {
  list_url?: string;
  list_item_selector?: string;
  link_selector?: string;
  detail_selector?: string;
  content_selector?: string;
  pagination_selector?: string;
  max_pages?: number;
  page_param?: string;
  keywords?: string[];
  search_engine?: string;
  max_results?: number;
  language?: string;
  time_range?: string;
  account_url?: string;
  max_posts?: number;
}

export interface Source {
  id: string;
  name: string;
  company: string;
  source_type: string;
  url: string;
  enabled: boolean;
  schedule: string | null;
  parser_type: string | null;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // 采集策略相关字段
  crawl_strategy: string | null; // single_page, multi_page, search_keyword, social_media
  crawl_config: CrawlConfig | null; // 采集配置
  social_platform: string | null; // twitter, weibo, wechat, other
  social_account_id: string | null;
}

export interface RawRecord {
  id: string;
  source_id: string;
  company: string;
  title: string;
  url: string;
  published_at: string | null;
  crawled_at: string;
  raw_content: string | null;
  raw_html_snapshot: string | null;
  content_hash: string | null;
  language: string | null;
  crawl_status: string;
  dedupe_status: string;
  error_message: string | null;
}

export interface Fact {
  id: string;
  raw_record_id: string;
  company: string;
  fact_summary: string;
  topic_level_1: string;
  topic_level_2: string | null;
  event_type: string;
  entity_type: string;
  entity_name: string;
  importance_level: string;
  capability_level: string | null;
  confidence: string;
  published_at: string | null;
  source_url: string;
  needs_review: boolean;
  review_status: string;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  fact_id: string;
  company: string;
  insight_content: string;
  insight_type: string;
  impact_level: string;
  confidence: string;
  reasoning_brief: string | null;
  action_suggestion: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  today_fact_count: number;
  pending_review_count: number;
  insight_count: number;
  active_source_count: number;
}

export interface CompanyStats {
  company: string;
  count: number;
}

export interface TrendData {
  date: string;
  count: number;
  company: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  task_type: string;
  template: string;
  variables: string[];
  version: number;
  is_active: boolean;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_name: string;
  api_base_url: string | null;
  temperature: number;
  max_tokens: number;
  enabled: boolean;
  is_default: boolean;
  task_types: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}
