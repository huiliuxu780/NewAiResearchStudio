export interface CrawlTask {
  id: string;
  source_id: string;
  task_type: string;
  status: string; // pending, running, completed, failed, cancelled
  started_at: string | null;
  completed_at: string | null;
  records_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrawlTaskStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CrawlTasksFilter {
  status?: string;
  source_id?: string;
  task_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface CreateCrawlTaskData {
  source_id: string;
  task_type: string;
}
