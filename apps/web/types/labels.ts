import { Company, SourceType, EventType, ReviewStatus, CrawlStatus, DedupeStatus, ImportanceLevel, ConfidenceLevel, InsightType, ImpactLevel, Priority } from './enums';

export const companyLabels: Record<string, string> = {
  alibaba: '阿里巴巴',
  byte_dance: '字节跳动',
  tencent: '腾讯',
};

export const sourceTypeLabels: Record<string, string> = {
  official_blog: '官方博客',
  tech_article: '技术文章',
  news_report: '新闻报道',
  social_media: '社交媒体',
  research_paper: '研究论文',
  conference: '会议资料',
  internal_doc: '内部文档',
  other: '其他',
};

export const eventTypeLabels: Record<string, string> = {
  release: '发布',
  update: '更新',
  acquisition: '收购',
  investment: '投资',
  partnership: '合作',
  competition: '竞争',
  personnel_change: '人事变动',
  financial_report: '财务报告',
  legal_lawsuit: '法律诉讼',
  regulatory_penalty: '监管处罚',
  other: '其他',
};

export const reviewStatusLabels: Record<string, string> = {
  pending: '待复核',
  confirmed: '已确认',
  rejected: '已驳回',
  insight_generated: '已生成结论',
};

export const crawlStatusLabels: Record<string, string> = {
  pending: '待处理',
  success: '成功',
  failed: '失败',
};

export const dedupeStatusLabels: Record<string, string> = {
  pending: '待处理',
  new: '新记录',
  duplicate: '重复',
  extracted: '已抽取',
  extracted_empty: '抽取无结果',
};

export const importanceLevelLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const confidenceLevelLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const insightTypeLabels: Record<string, string> = {
  competitive_advantage: '竞争优势',
  risk_warning: '风险预警',
  growth_opportunity: '增长机会',
  operational_efficiency: '运营效率',
  market_position: '市场地位',
};

export const impactLevelLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const crawlStrategyLabels: Record<string, string> = {
  single_page: '整页读取',
  multi_page: '子页面遍历',
  search_keyword: '搜索关键词',
  social_media: '官方号观测',
};

export const socialPlatformLabels: Record<string, string> = {
  twitter: 'Twitter/X',
  weibo: '微博',
  wechat: '微信',
  other: '其他',
};

export const searchEngineLabels: Record<string, string> = {
  google: 'Google',
  bing: 'Bing',
};

export const languageLabels: Record<string, string> = {
  'zh-CN': '中文（简体）',
  'zh-TW': '中文（繁体）',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'fr': 'Français',
  'de': 'Deutsch',
  'es': 'Español',
};

export const timeRangeLabels: Record<string, string> = {
  'day': '过去 24 小时',
  'week': '过去一周',
  'month': '过去一个月',
  'year': '过去一年',
  'any': '不限时间',
};

export const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/' },
  { key: 'sources', label: '信息源管理', href: '/sources' },
  { key: 'raw-records', label: '原始记录', href: '/raw-records' },
  { key: 'facts', label: '标准化事实', href: '/facts' },
  { key: 'insights', label: '研究结论', href: '/insights' },
  { key: 'prompts', label: '提示词管理', href: '/prompts' },
  { key: 'models', label: '模型档案', href: '/models' },
  { key: 'tasks', label: '抓取任务', href: '/tasks' },
  { key: 'products', label: '产品档案', href: '/products' },
  { key: 'topics', label: '研究主题', href: '/topics' },
  { key: 'reports', label: '周报中心', href: '/reports' },
  { key: 'logs', label: '系统日志', href: '/logs' },
  { key: 'settings', label: '系统设置', href: '/settings' },
] as const;