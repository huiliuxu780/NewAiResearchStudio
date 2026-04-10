import { Company } from '@/types';

export type ProductType = 'chatbot' | 'assistant' | 'developer_tool' | 'enterprise_solution' | 'content_creation' | 'search' | 'education' | 'healthcare';

export type UpdateFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'irregular';

export interface Product {
  id: string;
  name: string;
  company: Company;
  productType: ProductType;
  positioning: string;
  description: string;
  capabilities: string[];
  updateFrequency: UpdateFrequency;
  relatedModels: string[];
  targetUsers: string[];
  pricing: string;
  status: 'active' | 'discontinued' | 'beta';
  launchDate: string;
  createdAt: string;
  updatedAt: string;
}

export const productTypeLabels: Record<ProductType, string> = {
  chatbot: '聊天机器人',
  assistant: '智能助手',
  developer_tool: '开发工具',
  enterprise_solution: '企业解决方案',
  content_creation: '内容创作',
  search: '智能搜索',
  education: '教育应用',
  healthcare: '医疗应用',
};

export const updateFrequencyLabels: Record<UpdateFrequency, string> = {
  daily: '每日更新',
  weekly: '每周更新',
  monthly: '每月更新',
  quarterly: '季度更新',
  irregular: '不定期更新',
};

export const mockProducts: Product[] = [
  {
    id: 'product-001',
    name: '通义千问APP',
    company: Company.ALIBABA,
    productType: 'chatbot',
    positioning: '面向个人用户的智能对话助手',
    description: '阿里云推出的智能对话应用，支持多轮对话、知识问答、创意写作等功能，集成通义千问大模型能力。',
    capabilities: ['多轮对话', '知识问答', '创意写作', '文档解读', '图片理解'],
    updateFrequency: 'weekly',
    relatedModels: ['通义千问-Max', '通义万相'],
    targetUsers: ['个人用户', '学生', '内容创作者'],
    pricing: '免费基础版，高级版19.9元/月',
    status: 'active',
    launchDate: '2025-09-01',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'product-002',
    name: '阿里云AI代码助手',
    company: Company.ALIBABA,
    productType: 'developer_tool',
    positioning: '面向开发者的智能编程助手',
    description: '集成在阿里云开发平台中的AI代码助手，支持代码补全、代码解释、代码优化、Bug修复等功能。',
    capabilities: ['代码补全', '代码解释', '代码优化', 'Bug修复', '单元测试生成'],
    updateFrequency: 'monthly',
    relatedModels: ['通义千问-Max'],
    targetUsers: ['软件开发者', '技术团队'],
    pricing: '按使用量计费，基础功能免费',
    status: 'active',
    launchDate: '2026-04-08',
    createdAt: '2026-04-08T00:00:00Z',
    updatedAt: '2026-04-08T00:00:00Z',
  },
  {
    id: 'product-003',
    name: '钉钉AI助手',
    company: Company.ALIBABA,
    productType: 'assistant',
    positioning: '企业办公场景智能助手',
    description: '集成在钉钉中的AI助手，支持会议纪要生成、文档摘要、智能回复、日程管理等功能。',
    capabilities: ['会议纪要', '文档摘要', '智能回复', '日程管理', '任务提醒'],
    updateFrequency: 'weekly',
    relatedModels: ['通义千问-Turbo'],
    targetUsers: ['企业员工', '办公人员'],
    pricing: '企业版包含，个人版免费',
    status: 'active',
    launchDate: '2025-11-01',
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-04-05T00:00:00Z',
  },
  {
    id: 'product-004',
    name: '豆包APP',
    company: Company.BYTE_DANCE,
    productType: 'chatbot',
    positioning: '面向年轻用户的创意对话助手',
    description: '字节跳动推出的智能对话应用，擅长创意写作、角色扮演、趣味对话，深受年轻用户喜爱。',
    capabilities: ['创意写作', '角色扮演', '趣味对话', '故事生成', '图片创作'],
    updateFrequency: 'daily',
    relatedModels: ['豆包-Pro', '豆包-Lite'],
    targetUsers: ['年轻用户', '内容创作者', '学生'],
    pricing: '免费',
    status: 'active',
    launchDate: '2025-10-01',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'product-005',
    name: '抖音AI特效',
    company: Company.BYTE_DANCE,
    productType: 'content_creation',
    positioning: '短视频创作AI工具',
    description: '抖音内置的AI特效功能，支持AI换装、AI配音、AI字幕、智能剪辑等，帮助用户快速创作优质内容。',
    capabilities: ['AI换装', 'AI配音', 'AI字幕', '智能剪辑', '特效推荐'],
    updateFrequency: 'weekly',
    relatedModels: ['豆包-Multimodal'],
    targetUsers: ['短视频创作者', '普通用户'],
    pricing: '免费',
    status: 'active',
    launchDate: '2025-08-01',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-04-07T00:00:00Z',
  },
  {
    id: 'product-006',
    name: '火山引擎AI平台',
    company: Company.BYTE_DANCE,
    productType: 'developer_tool',
    positioning: '企业级AI开发平台',
    description: '火山引擎提供的一站式AI开发平台，支持模型训练、微调、部署、监控等全流程。',
    capabilities: ['模型训练', '模型微调', '模型部署', 'API管理', '监控告警'],
    updateFrequency: 'monthly',
    relatedModels: ['豆包-Pro', '豆包-Code'],
    targetUsers: ['企业开发者', 'AI团队'],
    pricing: '按资源使用计费',
    status: 'active',
    launchDate: '2025-12-01',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'product-007',
    name: '微信AI助手',
    company: Company.TENCENT,
    productType: 'assistant',
    positioning: '微信内置智能助手',
    description: '微信内置的AI助手功能，支持智能搜索、翻译、摘要、日程提醒等，提升用户沟通效率。',
    capabilities: ['智能搜索', '翻译', '摘要', '日程提醒', '智能回复'],
    updateFrequency: 'weekly',
    relatedModels: ['混元-Lite'],
    targetUsers: ['微信用户', '办公人员'],
    pricing: '免费',
    status: 'beta',
    launchDate: '2026-04-06',
    createdAt: '2026-04-06T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'product-008',
    name: '腾讯文档AI',
    company: Company.TENCENT,
    productType: 'assistant',
    positioning: '在线文档智能助手',
    description: '腾讯文档内置的AI功能，支持智能写作、文档摘要、表格分析、PPT生成等。',
    capabilities: ['智能写作', '文档摘要', '表格分析', 'PPT生成', '翻译'],
    updateFrequency: 'monthly',
    relatedModels: ['混元-Pro'],
    targetUsers: ['办公人员', '学生', '团队'],
    pricing: '免费基础版，高级版9.9元/月',
    status: 'active',
    launchDate: '2025-10-01',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'product-009',
    name: '腾讯云AI服务',
    company: Company.TENCENT,
    productType: 'enterprise_solution',
    positioning: '企业级AI解决方案',
    description: '腾讯云提供的企业级AI服务，包括模型托管、智能客服、内容审核、语音识别等解决方案。',
    capabilities: ['模型托管', '智能客服', '内容审核', '语音识别', '图像识别'],
    updateFrequency: 'quarterly',
    relatedModels: ['混元-Pro', '混元-Multimodal'],
    targetUsers: ['企业客户', '开发者'],
    pricing: '按服务计费',
    status: 'active',
    launchDate: '2025-06-01',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-04-03T00:00:00Z',
  },
  {
    id: 'product-010',
    name: '混元APP',
    company: Company.TENCENT,
    productType: 'chatbot',
    positioning: '腾讯官方智能对话应用',
    description: '腾讯推出的智能对话应用，集成混元大模型能力，支持多轮对话、知识问答、创意写作等。',
    capabilities: ['多轮对话', '知识问答', '创意写作', '代码生成', '图片理解'],
    updateFrequency: 'weekly',
    relatedModels: ['混元-Pro', '混元-Multimodal'],
    targetUsers: ['个人用户', '开发者'],
    pricing: '免费',
    status: 'active',
    launchDate: '2025-09-15',
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'product-011',
    name: '盘古气象服务',
    company: Company.HUAWEI,
    productType: 'enterprise_solution',
    positioning: '专业气象预测服务',
    description: '基于盘古科学计算模型的气象预测服务，提供高精度天气预报，服务于农业、航空等行业。',
    capabilities: ['天气预报', '灾害预警', '气候分析', '农业指导', '航空支持'],
    updateFrequency: 'daily',
    relatedModels: ['盘古-Scientific'],
    targetUsers: ['农业企业', '航空公司', '政府部门'],
    pricing: '按调用次数计费',
    status: 'active',
    launchDate: '2025-05-01',
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
  },
  {
    id: 'product-012',
    name: '文心一言APP',
    company: Company.BAIDU,
    productType: 'chatbot',
    positioning: '百度智能对话应用',
    description: '百度推出的智能对话应用，集成文心一言大模型，擅长中文理解、知识问答、搜索增强。',
    capabilities: ['中文对话', '知识问答', '搜索增强', '创意写作', '图片理解'],
    updateFrequency: 'weekly',
    relatedModels: ['文心一言-4.0'],
    targetUsers: ['个人用户', '学生', '研究人员'],
    pricing: '免费基础版，高级版29.9元/月',
    status: 'active',
    launchDate: '2025-08-01',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-03-18T00:00:00Z',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find((product) => product.id === id);
};

export const getProductsByCompany = (company: Company): Product[] => {
  return mockProducts.filter((product) => product.company === company);
};

export const getProductsByType = (type: ProductType): Product[] => {
  return mockProducts.filter((product) => product.productType === type);
};