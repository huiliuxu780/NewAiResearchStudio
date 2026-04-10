import { Company } from '@/types';

export type ModelType = 'language' | 'multimodal' | 'code' | 'embedding' | 'image' | 'audio' | 'video';

export type ApiCapability = 'chat' | 'completion' | 'embedding' | 'fine_tuning' | 'streaming' | 'function_call';

export interface ModelUpdateHistory {
  version: string;
  date: string;
  changes: string;
}

export interface Model {
  id: string;
  name: string;
  company: Company;
  modelType: ModelType;
  description: string;
  releaseDate: string;
  pricing: string;
  capabilities: string[];
  contextLength: string;
  apiCapabilities: ApiCapability[];
  status: 'active' | 'deprecated' | 'beta';
  updateHistory: ModelUpdateHistory[];
  createdAt: string;
  updatedAt: string;
}

export const modelTypeLabels: Record<ModelType, string> = {
  language: '语言模型',
  multimodal: '多模态模型',
  code: '代码模型',
  embedding: '嵌入模型',
  image: '图像模型',
  audio: '音频模型',
  video: '视频模型',
};

export const apiCapabilityLabels: Record<ApiCapability, string> = {
  chat: '对话',
  completion: '补全',
  embedding: '嵌入',
  fine_tuning: '微调',
  streaming: '流式输出',
  function_call: '函数调用',
};

export const mockModels: Model[] = [
  {
    id: 'model-001',
    name: '通义千问-Max',
    company: Company.ALIBABA,
    modelType: 'language',
    description: '阿里云通义千问系列旗舰模型，在推理、代码生成、多语言理解等方面表现卓越，适合复杂任务场景。',
    releaseDate: '2026-04-10',
    pricing: '输入: 0.02元/千tokens, 输出: 0.06元/千tokens',
    capabilities: ['长文本理解', '代码生成', '数学推理', '多语言支持', '知识问答'],
    contextLength: '32K tokens',
    apiCapabilities: ['chat', 'completion', 'streaming', 'function_call'],
    status: 'active',
    updateHistory: [
      { version: '2.5', date: '2026-04-10', changes: '推理能力大幅提升，新增函数调用支持' },
      { version: '2.0', date: '2025-12-01', changes: '上下文长度扩展至32K，优化多语言能力' },
      { version: '1.5', date: '2025-08-15', changes: '首次发布，基础对话和补全能力' },
    ],
    createdAt: '2025-08-15T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'model-002',
    name: '通义千问-Turbo',
    company: Company.ALIBABA,
    modelType: 'language',
    description: '通义千问轻量版模型，响应速度快，成本低，适合高频调用场景。',
    releaseDate: '2026-03-15',
    pricing: '输入: 0.008元/千tokens, 输出: 0.02元/千tokens',
    capabilities: ['快速响应', '基础对话', '文本生成', '摘要提取'],
    contextLength: '8K tokens',
    apiCapabilities: ['chat', 'completion', 'streaming'],
    status: 'active',
    updateHistory: [
      { version: '2.0', date: '2026-03-15', changes: '响应速度提升50%，成本降低30%' },
      { version: '1.0', date: '2025-10-01', changes: '首次发布' },
    ],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'model-003',
    name: '通义万相',
    company: Company.ALIBABA,
    modelType: 'multimodal',
    description: '阿里云多模态大模型，支持图像理解、图像生成、视频分析等多种视觉任务。',
    releaseDate: '2026-02-20',
    pricing: '图像理解: 0.05元/次, 图像生成: 0.1元/次',
    capabilities: ['图像理解', '图像生成', '视频分析', '图文问答', 'OCR识别'],
    contextLength: '4K tokens + 图像',
    apiCapabilities: ['chat', 'completion'],
    status: 'active',
    updateHistory: [
      { version: '1.5', date: '2026-02-20', changes: '新增视频分析能力，图像生成质量提升' },
      { version: '1.0', date: '2025-11-01', changes: '首次发布，支持图像理解和生成' },
    ],
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'model-004',
    name: '豆包-Pro',
    company: Company.BYTE_DANCE,
    modelType: 'language',
    description: '字节跳动豆包大模型旗舰版本，在创意写作、对话理解、知识问答等方面表现优异。',
    releaseDate: '2026-04-10',
    pricing: '输入: 0.015元/千tokens, 输出: 0.05元/千tokens',
    capabilities: ['创意写作', '对话理解', '知识问答', '代码生成', '多轮对话'],
    contextLength: '128K tokens',
    apiCapabilities: ['chat', 'completion', 'streaming', 'function_call', 'fine_tuning'],
    status: 'active',
    updateHistory: [
      { version: '2.0', date: '2026-04-10', changes: '上下文扩展至128K，新增微调支持' },
      { version: '1.5', date: '2025-12-15', changes: '创意写作能力大幅提升' },
      { version: '1.0', date: '2025-09-01', changes: '首次发布' },
    ],
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'model-005',
    name: '豆包-Lite',
    company: Company.BYTE_DANCE,
    modelType: 'language',
    description: '豆包轻量版模型，专为移动端和实时交互场景优化。',
    releaseDate: '2026-01-15',
    pricing: '输入: 0.005元/千tokens, 输出: 0.015元/千tokens',
    capabilities: ['快速响应', '基础对话', '文本生成'],
    contextLength: '4K tokens',
    apiCapabilities: ['chat', 'streaming'],
    status: 'active',
    updateHistory: [
      { version: '1.0', date: '2026-01-15', changes: '首次发布，专为移动端优化' },
    ],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'model-006',
    name: '豆包-Code',
    company: Company.BYTE_DANCE,
    modelType: 'code',
    description: '字节跳动代码专用模型，支持多种编程语言，擅长代码生成、补全、解释和优化。',
    releaseDate: '2026-03-01',
    pricing: '输入: 0.01元/千tokens, 输出: 0.03元/千tokens',
    capabilities: ['代码生成', '代码补全', '代码解释', '代码优化', 'Bug修复'],
    contextLength: '16K tokens',
    apiCapabilities: ['chat', 'completion', 'streaming'],
    status: 'active',
    updateHistory: [
      { version: '1.5', date: '2026-03-01', changes: '新增Bug修复能力，支持更多编程语言' },
      { version: '1.0', date: '2025-11-15', changes: '首次发布' },
    ],
    createdAt: '2025-11-15T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'model-007',
    name: '混元-Pro',
    company: Company.TENCENT,
    modelType: 'language',
    description: '腾讯混元大模型旗舰版本，在长文本理解、多轮对话、企业应用等方面表现突出。',
    releaseDate: '2026-04-10',
    pricing: '输入: 0.018元/千tokens, 输出: 0.055元/千tokens',
    capabilities: ['长文本理解', '多轮对话', '企业应用', '知识问答', '代码生成'],
    contextLength: '64K tokens',
    apiCapabilities: ['chat', 'completion', 'streaming', 'function_call', 'fine_tuning'],
    status: 'active',
    updateHistory: [
      { version: '3.0', date: '2026-04-10', changes: '长文本理解能力大幅提升，新增微调支持' },
      { version: '2.5', date: '2025-12-20', changes: '上下文扩展至64K' },
      { version: '2.0', date: '2025-09-15', changes: '多轮对话能力优化' },
      { version: '1.0', date: '2025-06-01', changes: '首次发布' },
    ],
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'model-008',
    name: '混元-Lite',
    company: Company.TENCENT,
    modelType: 'language',
    description: '混元轻量版模型，适合微信小程序、即时通讯等场景。',
    releaseDate: '2026-02-01',
    pricing: '输入: 0.006元/千tokens, 输出: 0.018元/千tokens',
    capabilities: ['快速响应', '基础对话', '文本生成'],
    contextLength: '8K tokens',
    apiCapabilities: ['chat', 'streaming'],
    status: 'active',
    updateHistory: [
      { version: '1.0', date: '2026-02-01', changes: '首次发布，专为即时通讯场景优化' },
    ],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'model-009',
    name: '混元-Multimodal',
    company: Company.TENCENT,
    modelType: 'multimodal',
    description: '腾讯多模态大模型，支持图像、视频、音频等多种媒体内容的理解和生成。',
    releaseDate: '2026-01-20',
    pricing: '图像理解: 0.04元/次, 视频分析: 0.15元/分钟',
    capabilities: ['图像理解', '视频分析', '音频识别', '图文问答', '内容审核'],
    contextLength: '8K tokens + 多媒体',
    apiCapabilities: ['chat', 'completion'],
    status: 'active',
    updateHistory: [
      { version: '1.0', date: '2026-01-20', changes: '首次发布' },
    ],
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'model-010',
    name: '盘古-Scientific',
    company: Company.HUAWEI,
    modelType: 'language',
    description: '华为盘古科学计算大模型，专为气象预测、药物研发、材料设计等专业领域优化。',
    releaseDate: '2026-03-20',
    pricing: '按任务计费，气象预测: 5元/次, 药物研发: 50元/次',
    capabilities: ['气象预测', '药物研发', '材料设计', '科学计算', '数据分析'],
    contextLength: '32K tokens',
    apiCapabilities: ['chat', 'completion'],
    status: 'active',
    updateHistory: [
      { version: '3.0', date: '2026-03-20', changes: '气象预测准确率提升20%，新增材料设计能力' },
      { version: '2.0', date: '2025-10-01', changes: '新增药物研发能力' },
      { version: '1.0', date: '2025-05-01', changes: '首次发布，专注气象预测' },
    ],
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    id: 'model-011',
    name: '文心一言-4.0',
    company: Company.BAIDU,
    modelType: 'language',
    description: '百度文心一言旗舰版本，在中文理解、知识问答、创意写作等方面表现卓越。',
    releaseDate: '2026-03-18',
    pricing: '输入: 0.012元/千tokens, 输出: 0.04元/千tokens',
    capabilities: ['中文理解', '知识问答', '创意写作', '代码生成', '搜索增强'],
    contextLength: '48K tokens',
    apiCapabilities: ['chat', 'completion', 'streaming', 'function_call'],
    status: 'active',
    updateHistory: [
      { version: '4.0', date: '2026-03-18', changes: '中文理解能力大幅提升，新增搜索增强' },
      { version: '3.5', date: '2025-12-01', changes: '知识问答能力优化' },
      { version: '3.0', date: '2025-08-01', changes: '上下文扩展至48K' },
    ],
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
  },
  {
    id: 'model-012',
    name: '通义千问-Embedding',
    company: Company.ALIBABA,
    modelType: 'embedding',
    description: '阿里云文本嵌入模型，支持中文和多语言文本向量化，适合检索、聚类等场景。',
    releaseDate: '2026-01-10',
    pricing: '0.001元/千tokens',
    capabilities: ['文本嵌入', '语义检索', '相似度计算', '聚类分析'],
    contextLength: '8K tokens',
    apiCapabilities: ['embedding'],
    status: 'active',
    updateHistory: [
      { version: '1.0', date: '2026-01-10', changes: '首次发布' },
    ],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

export const getModelById = (id: string): Model | undefined => {
  return mockModels.find((model) => model.id === id);
};

export const getModelsByCompany = (company: Company): Model[] => {
  return mockModels.filter((model) => model.company === company);
};

export const getModelsByType = (type: ModelType): Model[] => {
  return mockModels.filter((model) => model.modelType === type);
};