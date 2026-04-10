import { WeekReportStatus } from '@/types';

export type ReportType = 'daily' | 'weekly' | 'special';

export interface Report {
  id: string;
  title: string;
  reportType: ReportType;
  generatedAt: string;
  status: WeekReportStatus;
  relatedFactCount: number;
  relatedInsightCount: number;
  content: string;
  summary: string;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const reportTypeLabels: Record<ReportType, string> = {
  daily: '日报',
  weekly: '周报',
  special: '专题报告',
};

export const mockReports: Report[] = [
  {
    id: 'report-001',
    title: '2026年第15周AI行业动态周报',
    reportType: 'weekly',
    generatedAt: '2026-04-10',
    status: WeekReportStatus.PUBLISHED,
    relatedFactCount: 18,
    relatedInsightCount: 6,
    content: `## 本周重点动态

### 模型发布
- 阿里云发布通义千问2.5版本，推理能力大幅提升
- 字节跳动发布豆包大模型2.0，对话和创意能力增强
- 腾讯混元大模型升级至3.0，长文本理解能力提升

### 产品更新
- 阿里云推出AI代码助手Copilot
- 微信AI助手功能开始内测
- 抖音AI特效功能全面升级

### 技术突破
- 达摩院在CVPR 2026发表多模态研究成果
- 腾讯AI Lab语音识别模型在嘈杂环境下准确率提升15%

## 行业洞察
本周三大互联网公司均发布了大模型新版本，竞争态势加剧。从技术角度看，各家都在长文本理解、多模态能力方面持续突破。产品层面，AI助手和开发工具成为重点发力方向。

## 下周关注重点
1. 微信AI助手内测进展
2. 各公司API定价策略变化
3. 企业客户采用情况`,
    summary: '本周阿里、字节、腾讯均发布大模型新版本，AI助手和开发工具成为产品重点。',
    author: 'AI研究团队',
    publishedAt: '2026-04-10T18:00:00Z',
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-04-10T18:00:00Z',
  },
  {
    id: 'report-002',
    title: '2026年4月10日AI行业日报',
    reportType: 'daily',
    generatedAt: '2026-04-10',
    status: WeekReportStatus.PUBLISHED,
    relatedFactCount: 5,
    relatedInsightCount: 2,
    content: `## 今日重点

### 模型发布
- 通义千问2.5正式发布，新增函数调用支持
- 豆包2.0发布，上下文扩展至128K
- 混元3.0发布，长文本理解能力大幅提升

### 产品动态
- 阿里云AI代码助手上线

## 简要分析
今日三大公司同步发布大模型更新，显示行业竞争进入白热化阶段。各家都在扩展上下文长度和增强推理能力。`,
    summary: '今日阿里、字节、腾讯同步发布大模型新版本，行业竞争加剧。',
    author: 'AI研究团队',
    publishedAt: '2026-04-10T20:00:00Z',
    createdAt: '2026-04-10T16:00:00Z',
    updatedAt: '2026-04-10T20:00:00Z',
  },
  {
    id: 'report-003',
    title: '2026年第14周AI行业动态周报',
    reportType: 'weekly',
    generatedAt: '2026-04-03',
    status: WeekReportStatus.PUBLISHED,
    relatedFactCount: 15,
    relatedInsightCount: 5,
    content: `## 本周重点动态

### 产品发布
- 火山引擎推出H100 GPU云服务器
- 腾讯云推出AI模型托管服务

### 技术更新
- 火山引擎AI平台新增微调、标注、评估功能
- 腾讯AI Lab开源多语言模型

### 合作动态
- 阿里云与多家企业达成AI战略合作

## 行业洞察
本周基础设施和平台服务成为重点，各家都在完善AI开发工具链。开源策略持续推进，降低AI应用门槛。

## 下周关注重点
1. 预期大模型新版本发布
2. 企业合作落地进展`,
    summary: '本周基础设施和平台服务成为重点，开源策略持续推进。',
    author: 'AI研究团队',
    publishedAt: '2026-04-03T18:00:00Z',
    createdAt: '2026-04-03T10:00:00Z',
    updatedAt: '2026-04-03T18:00:00Z',
  },
  {
    id: 'report-004',
    title: '大模型竞争格局专题分析报告',
    reportType: 'special',
    generatedAt: '2026-04-05',
    status: WeekReportStatus.PUBLISHED,
    relatedFactCount: 30,
    relatedInsightCount: 10,
    content: `## 报告摘要

本报告对阿里、字节、腾讯、百度、华为五家公司的大模型产品进行全面对比分析。

## 产品对比

### 通义千问系列
- 旗舰版Max：32K上下文，推理能力强
- 轻量版Turbo：成本低，响应快
- 多模态万相：图像视频理解

### 豆包系列
- Pro版：128K上下文，创意写作强
- Lite版：移动端优化
- Code版：代码专用

### 混元系列
- Pro版：64K上下文，企业应用强
- Lite版：即时通讯优化
- Multimodal：多模态能力

### 文心一言
- 4.0版本：中文理解强，搜索增强

### 盘古
- Scientific版：科学计算专用

## 竞争态势分析

1. 技术层面：各家都在扩展上下文、增强推理能力
2. 产品层面：AI助手和开发工具成为重点
3. 商业层面：API定价趋于灵活，企业市场竞争加剧

## 建议
建议重点关注企业客户采用情况和API定价变化。`,
    summary: '五家公司大模型产品对比分析，技术、产品、商业三个维度洞察竞争态势。',
    author: 'AI研究团队',
    publishedAt: '2026-04-05T18:00:00Z',
    createdAt: '2026-04-05T08:00:00Z',
    updatedAt: '2026-04-05T18:00:00Z',
  },
  {
    id: 'report-005',
    title: '2026年第16周AI行业动态周报',
    reportType: 'weekly',
    generatedAt: '2026-04-17',
    status: WeekReportStatus.DRAFT,
    relatedFactCount: 0,
    relatedInsightCount: 0,
    content: '',
    summary: '',
    author: 'AI研究团队',
    publishedAt: null,
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
  },
  {
    id: 'report-006',
    title: '2026年4月9日AI行业日报',
    reportType: 'daily',
    generatedAt: '2026-04-09',
    status: WeekReportStatus.PUBLISHED,
    relatedFactCount: 3,
    relatedInsightCount: 1,
    content: `## 今日重点

### 产品发布
- 火山引擎推出新一代GPU云服务器

### 技术动态
- 火山引擎AI平台功能更新

## 简要分析
字节跳动今日在基础设施层面发力，推出高性能GPU服务器，完善AI开发平台。`,
    summary: '火山引擎推出H100 GPU服务器，AI平台功能更新。',
    author: 'AI研究团队',
    publishedAt: '2026-04-09T20:00:00Z',
    createdAt: '2026-04-09T16:00:00Z',
    updatedAt: '2026-04-09T20:00:00Z',
  },
  {
    id: 'report-007',
    title: 'AI代码助手市场专题分析',
    reportType: 'special',
    generatedAt: '2026-04-08',
    status: WeekReportStatus.DRAFT,
    relatedFactCount: 12,
    relatedInsightCount: 4,
    content: `## 报告框架

### 产品对比
- 阿里云AI代码助手
- 豆包-Code
- 其他竞品

### 功能分析
- 代码补全
- 代码解释
- Bug修复
- 单元测试生成

### 市场分析
待补充...`,
    summary: 'AI代码助手产品对比分析报告（草稿）',
    author: 'AI研究团队',
    publishedAt: null,
    createdAt: '2026-04-08T08:00:00Z',
    updatedAt: '2026-04-08T10:00:00Z',
  },
];

export const getReportById = (id: string): Report | undefined => {
  return mockReports.find((report) => report.id === id);
};

export const getReportsByType = (type: ReportType): Report[] => {
  return mockReports.filter((report) => report.reportType === type);
};

export const getReportsByStatus = (status: WeekReportStatus): Report[] => {
  return mockReports.filter((report) => report.status === status);
};