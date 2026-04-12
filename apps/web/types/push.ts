export interface PushChannel {
  id: string;
  name: string;
  channel_type: string;
  is_enabled: boolean;
  config: Record<string, unknown>;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushTask {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  cron_expression: string | null;
  schedule_config: Record<string, unknown> | null;
  channel_ids: string[];
  template_id: string | null;
  is_enabled: boolean;
  status: string;
  max_retries: number;
  retry_interval: number;
  event_type: string | null;
  event_filters: Record<string, unknown> | null;
  content_config: Record<string, unknown>;
  total_executions: number;
  success_count: number;
  failure_count: number;
  last_executed_at: string | null;
  next_scheduled_at: string | null;
  alert_on_failure: boolean;
  alert_channel_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushRecord {
  id: string;
  task_id: string;
  channel_id: string;
  channel_type: string;
  status: string;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  title: string;
  content: string;
  content_format: string;
  recipients: string[];
  response_data: Record<string, unknown> | null;
  error_message: string | null;
  error_code: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface PushTemplate {
  id: string;
  name: string;
  description: string | null;
  channel_types: string[];
  title_template: string;
  content_template: string;
  content_format: string;
  variables: Record<string, unknown>;
  default_values: Record<string, unknown>;
  is_enabled: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushTemplatePreview {
  rendered_title: string;
  rendered_content: string;
  content_format: string;
}

export interface PushStatsSummary {
  total_tasks: number;
  enabled_tasks: number;
  total_records: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  retrying_count: number;
  success_rate: number;
  avg_duration_ms: number | null;
}

export interface PushStatsByChannel {
  channel_type: string;
  channel_name: string;
  total_count: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
}

export interface PushStatsByTask {
  task_id: string;
  task_name: string;
  total_count: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  last_executed_at: string | null;
}

export interface PushErrorDistribution {
  error_code: string | null;
  error_message: string | null;
  count: number;
  percentage: number;
}

export interface PushTrendPoint {
  date: string;
  total_count: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
}

export interface PushStats {
  summary: PushStatsSummary;
  by_channel: PushStatsByChannel[];
  by_task: PushStatsByTask[];
  error_distribution: PushErrorDistribution[];
  trend: PushTrendPoint[];
}

export interface PushChannelsFilter {
  channel_type?: string;
  is_enabled?: boolean;
  page?: number;
  page_size?: number;
}

export interface PushTasksFilter {
  trigger_type?: string;
  status?: string;
  is_enabled?: boolean;
  page?: number;
  page_size?: number;
}

export interface PushRecordsFilter {
  task_id?: string;
  channel_id?: string;
  status?: string;
  channel_type?: string;
  page?: number;
  page_size?: number;
}

export interface PushTemplatesFilter {
  is_enabled?: boolean;
  page?: number;
  page_size?: number;
}

export interface TriggerPushTaskData {
  channel_ids?: string[];
  template_variables?: Record<string, unknown>;
}

export interface RetryPushRecordData {
  max_retries?: number;
}

export interface PreviewPushTemplateData {
  variables: Record<string, unknown>;
}
