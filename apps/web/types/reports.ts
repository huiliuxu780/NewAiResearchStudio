export interface WeeklyReport {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  content: {
    sections: ReportSection[];
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  title: string;
  type: string;
  content: string;
  stats?: Record<string, any>;
}

export interface GenerateReportData {
  company: string;
  start_date: string;
  end_date: string;
}

export interface ReportsFilter {
  company?: string;
  page?: number;
  page_size?: number;
}

export const COMPANY_LABELS: Record<string, string> = {
  alibaba: "阿里巴巴",
  byte_dance: "字节跳动",
  tencent: "腾讯",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  generated: "已生成",
  published: "已发布",
};
