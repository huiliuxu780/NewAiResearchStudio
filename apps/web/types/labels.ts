import { Company, SourceType, EventType, RawRecordStatus, FactStatus, InsightStatus, InsightType, Priority, WeekReportStatus } from './enums';

export const companyLabels: Record<Company, string> = {
  [Company.ALIBABA]: '阿里巴巴',
  [Company.BYTE_DANCE]: '字节跳动',
  [Company.TENCENT]: '腾讯',
  [Company.BAIDU]: '百度',
  [Company.HUAWEI]: '华为',
  [Company.XIAOMI]: '小米',
  [Company.MEITUAN]: '美团',
  [Company.JD]: '京东',
  [Company.KUAISHOU]: '快手',
  [Company.OTHER]: '其他',
};

export const sourceTypeLabels: Record<SourceType, string> = {
  [SourceType.OFFICIAL_BLOG]: '官方博客',
  [SourceType.TECH_ARTICLE]: '技术文章',
  [SourceType.NEWS_REPORT]: '新闻报道',
  [SourceType.SOCIAL_MEDIA]: '社交媒体',
  [SourceType.RESEARCH_PAPER]: '研究论文',
  [SourceType.CONFERENCE]: '会议资料',
  [SourceType.INTERNAL_DOC]: '内部文档',
  [SourceType.OTHER]: '其他',
};

export const eventTypeLabels: Record<EventType, string> = {
  [EventType.PRODUCT_LAUNCH]: '产品发布',
  [EventType.MODEL_RELEASE]: '模型发布',
  [EventType.TECH_UPDATE]: '技术更新',
  [EventType.STRATEGY_CHANGE]: '战略调整',
  [EventType.PERSONNEL_CHANGE]: '人事变动',
  [EventType.PARTNERSHIP]: '合作动态',
  [EventType.INVESTMENT]: '投资融资',
  [EventType.ACQUISITION]: '收购并购',
  [EventType.OTHER]: '其他',
};

export const rawRecordStatusLabels: Record<RawRecordStatus, string> = {
  [RawRecordStatus.PENDING]: '待处理',
  [RawRecordStatus.PROCESSING]: '处理中',
  [RawRecordStatus.COMPLETED]: '已完成',
  [RawRecordStatus.FAILED]: '处理失败',
};

export const factStatusLabels: Record<FactStatus, string> = {
  [FactStatus.DRAFT]: '草稿',
  [FactStatus.PENDING_REVIEW]: '待复核',
  [FactStatus.APPROVED]: '已通过',
  [FactStatus.REJECTED]: '已驳回',
};

export const insightStatusLabels: Record<InsightStatus, string> = {
  [InsightStatus.DRAFT]: '草稿',
  [InsightStatus.PENDING_REVIEW]: '待审核',
  [InsightStatus.APPROVED]: '已发布',
  [InsightStatus.ARCHIVED]: '已归档',
};

export const insightTypeLabels: Record<InsightType, string> = {
  [InsightType.TREND_ANALYSIS]: '趋势分析',
  [InsightType.COMPETITIVE_INTELLIGENCE]: '竞品情报',
  [InsightType.PRODUCT_ANALYSIS]: '产品分析',
  [InsightType.TECH_EVALUATION]: '技术评估',
  [InsightType.MARKET_INSIGHT]: '市场洞察',
  [InsightType.STRATEGIC_RECOMMENDATION]: '战略建议',
};

export const priorityLabels: Record<Priority, string> = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高',
  [Priority.URGENT]: '紧急',
};

export const weekReportStatusLabels: Record<WeekReportStatus, string> = {
  [WeekReportStatus.DRAFT]: '草稿',
  [WeekReportStatus.PUBLISHED]: '已发布',
  [WeekReportStatus.ARCHIVED]: '已归档',
};

export const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/' },
  { key: 'sources', label: '信息源管理', href: '/sources' },
  { key: 'raw-records', label: '原始记录', href: '/raw-records' },
  { key: 'facts', label: '标准化事实', href: '/facts' },
  { key: 'insights', label: '研究结论', href: '/insights' },
  { key: 'models', label: '模型档案', href: '/models' },
  { key: 'products', label: '产品档案', href: '/products' },
  { key: 'topics', label: '研究主题', href: '/topics' },
  { key: 'reports', label: '周报中心', href: '/reports' },
  { key: 'settings', label: '系统设置', href: '/settings' },
] as const;