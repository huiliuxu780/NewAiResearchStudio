import { Company } from '@/types';

export type TopicStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  status: TopicStatus;
  companies: Company[];
  keywords: string[];
  relatedFactCount: number;
  relatedInsightCount: number;
  createdAt: string;
  updatedAt: string;
}

export const topicStatusLabels: Record<TopicStatus, string> = {
  active: '进行中',
  paused: '已暂停',
  completed: '已完成',
  archived: '已归档',
};

export const mockTopics: ResearchTopic[] = [
  {
    id: 'topic-001',
    name: '大模型竞争格局分析',
    description: '跟踪分析阿里、字节、腾讯等公司的大模型产品发布、技术迭代、市场策略，洞察行业竞争态势。',
    status: 'active',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.TENCENT, Company.BAIDU, Company.HUAWEI],
    keywords: ['大模型', '竞争格局', '技术迭代', '市场策略'],
    relatedFactCount: 25,
    relatedInsightCount: 8,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'topic-002',
    name: 'AI代码助手发展追踪',
    description: '研究各公司AI代码助手产品的功能演进、用户体验、商业模式，分析开发者工具市场趋势。',
    status: 'active',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.TENCENT],
    keywords: ['代码助手', '开发者工具', 'Copilot', '代码生成'],
    relatedFactCount: 12,
    relatedInsightCount: 4,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-04-08T00:00:00Z',
  },
  {
    id: 'topic-003',
    name: '多模态技术进展',
    description: '跟踪多模态大模型的技术突破、应用场景拓展、商业化进展，关注图像、视频、音频理解能力。',
    status: 'active',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.TENCENT],
    keywords: ['多模态', '图像理解', '视频分析', '跨模态'],
    relatedFactCount: 18,
    relatedInsightCount: 6,
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'topic-004',
    name: '企业AI解决方案市场',
    description: '分析各公司企业级AI解决方案的产品定位、客户案例、定价策略，洞察企业AI市场发展。',
    status: 'active',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.TENCENT, Company.HUAWEI],
    keywords: ['企业AI', '解决方案', 'B端市场', '商业化'],
    relatedFactCount: 15,
    relatedInsightCount: 5,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-04-03T00:00:00Z',
  },
  {
    id: 'topic-005',
    name: 'AI芯片与算力竞争',
    description: '跟踪AI芯片研发进展、算力布局策略、云服务定价变化，分析算力市场竞争格局。',
    status: 'active',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.HUAWEI],
    keywords: ['AI芯片', '算力', 'GPU', '云服务'],
    relatedFactCount: 10,
    relatedInsightCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-04-09T00:00:00Z',
  },
  {
    id: 'topic-006',
    name: '短视频AI应用创新',
    description: '研究抖音、快手等短视频平台的AI功能创新，分析AI特效、智能剪辑、内容推荐等技术应用。',
    status: 'active',
    companies: [Company.BYTE_DANCE, Company.KUAISHOU],
    keywords: ['短视频', 'AI特效', '智能剪辑', '内容创作'],
    relatedFactCount: 8,
    relatedInsightCount: 2,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-04-07T00:00:00Z',
  },
  {
    id: 'topic-007',
    name: 'AI安全与治理研究',
    description: '跟踪AI安全技术研究、行业治理规范制定、企业安全实践，分析AI安全发展趋势。',
    status: 'paused',
    companies: [Company.ALIBABA, Company.TENCENT, Company.BAIDU],
    keywords: ['AI安全', '治理', '合规', '风险控制'],
    relatedFactCount: 6,
    relatedInsightCount: 2,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-04-02T00:00:00Z',
  },
  {
    id: 'topic-008',
    name: '开源大模型生态',
    description: '研究各公司开源大模型策略、开源社区贡献、开源模型应用，分析开源生态发展。',
    status: 'active',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.TENCENT, Company.BAIDU],
    keywords: ['开源', '大模型', '社区', '生态'],
    relatedFactCount: 14,
    relatedInsightCount: 4,
    createdAt: '2025-11-15T00:00:00Z',
    updatedAt: '2026-04-04T00:00:00Z',
  },
  {
    id: 'topic-009',
    name: 'AI助手产品对比',
    description: '对比分析各公司AI助手产品的功能差异、用户体验、商业模式，洞察AI助手市场格局。',
    status: 'completed',
    companies: [Company.ALIBABA, Company.BYTE_DANCE, Company.TENCENT, Company.BAIDU],
    keywords: ['AI助手', '产品对比', '用户体验', '商业模式'],
    relatedFactCount: 20,
    relatedInsightCount: 7,
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'topic-010',
    name: '科学计算AI应用',
    description: '研究AI在气象预测、药物研发、材料设计等科学计算领域的应用进展。',
    status: 'active',
    companies: [Company.HUAWEI],
    keywords: ['科学计算', '气象预测', '药物研发', '材料设计'],
    relatedFactCount: 5,
    relatedInsightCount: 1,
    createdAt: '2026-03-20T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
];

export const getTopicById = (id: string): ResearchTopic | undefined => {
  return mockTopics.find((topic) => topic.id === id);
};

export const getTopicsByCompany = (company: Company): ResearchTopic[] => {
  return mockTopics.filter((topic) => topic.companies.includes(company));
};

export const getTopicsByStatus = (status: TopicStatus): ResearchTopic[] => {
  return mockTopics.filter((topic) => topic.status === status);
};