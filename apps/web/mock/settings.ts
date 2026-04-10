export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  apiEndpoint: string;
  modelVersion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageConfig {
  id: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrawlConfig {
  id: string;
  name: string;
  targetUrl: string;
  crawlInterval: number;
  maxDepth: number;
  timeout: number;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CronTask {
  id: string;
  name: string;
  schedule: string;
  command: string;
  description: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const mockModelConfigs: ModelConfig[] = [
  {
    id: 'config-001',
    name: '通义千问API配置',
    provider: '阿里云',
    apiKey: 'sk-xxxxxxxxxxxxxxxx',
    apiEndpoint: 'https://dashscope.aliyuncs.com/api/v1',
    modelVersion: 'qwen-max',
    isActive: true,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
];

export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'template-001',
    name: '事实提取模板',
    category: 'fact_extraction',
    content: '请从以下内容中提取关键事实信息...',
    variables: ['content', 'company'],
    description: '用于从原始记录中提取标准化事实',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'template-002',
    name: '洞察生成模板',
    category: 'insight_generation',
    content: '请基于以下事实生成研究洞察...',
    variables: ['facts', 'topic'],
    description: '用于从事实集合中生成研究洞察',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'template-003',
    name: '周报生成模板',
    category: 'report_generation',
    content: '请基于本周事实和洞察生成周报...',
    variables: ['facts', 'insights', 'week_range'],
    description: '用于自动生成周报内容',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
];

export const mockStorageConfigs: StorageConfig[] = [
  {
    id: 'storage-001',
    type: 'PostgreSQL',
    host: 'localhost',
    port: 5432,
    database: 'ai_research',
    username: 'admin',
    password: '********',
    isActive: true,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
];

export const mockCrawlConfigs: CrawlConfig[] = [
  {
    id: 'crawl-001',
    name: '阿里云官方博客抓取',
    targetUrl: 'https://developer.aliyun.com/blog',
    crawlInterval: 3600,
    maxDepth: 2,
    timeout: 30,
    userAgent: 'AI-Research-Bot/1.0',
    isActive: true,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'crawl-002',
    name: '字节跳动技术博客抓取',
    targetUrl: 'https://techblog.bytedance.com',
    crawlInterval: 3600,
    maxDepth: 2,
    timeout: 30,
    userAgent: 'AI-Research-Bot/1.0',
    isActive: true,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
];

export const mockCronTasks: CronTask[] = [
  {
    id: 'cron-001',
    name: '每日数据抓取',
    schedule: '0 6 * * *',
    command: 'crawl:daily',
    description: '每天早上6点执行数据抓取任务',
    isActive: true,
    lastRunAt: '2026-04-10T06:00:00Z',
    nextRunAt: '2026-04-11T06:00:00Z',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'cron-002',
    name: '周报自动生成',
    schedule: '0 10 * * 1',
    command: 'report:weekly',
    description: '每周一上午10点自动生成周报',
    isActive: true,
    lastRunAt: '2026-04-07T10:00:00Z',
    nextRunAt: '2026-04-14T10:00:00Z',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-04-07T00:00:00Z',
  },
  {
    id: 'cron-003',
    name: '数据清理任务',
    schedule: '0 2 1 * *',
    command: 'cleanup:monthly',
    description: '每月1日凌晨2点清理过期数据',
    isActive: true,
    lastRunAt: '2026-04-01T02:00:00Z',
    nextRunAt: '2026-05-01T02:00:00Z',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
];