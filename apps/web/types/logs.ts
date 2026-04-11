export interface OperationLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface AILog {
  id: string;
  task_type: string;
  model_name: string;
  input_prompt: string | null;
  output_result: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_ms: number;
  status: string;
  error_message: string | null;
  source_entity_id: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const ACTION_LABELS: Record<string, string> = {
  create: "创建",
  update: "更新",
  delete: "删除",
  read: "查询",
};

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  source: "数据源",
  fact: "标准化事实",
  insight: "研究结论",
  raw_record: "原始记录",
  task: "任务",
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  fact_extraction: "事实抽取",
  insight_generation: "结论生成",
};

export const STATUS_LABELS: Record<string, string> = {
  success: "成功",
  failed: "失败",
};
